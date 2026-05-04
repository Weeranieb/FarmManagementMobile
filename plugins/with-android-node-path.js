/**
 * Ensures Gradle can find `node` when Android Studio runs without nvm/fnm on PATH.
 * Patches `settings.gradle` (inline resolver inside `pluginManagement` — must be first in file)
 * and `app/build.gradle`, copies `node-path.gradle` for the app module, and sets
 * `node.executable` in `local.properties` from the Node that runs prebuild.
 */
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const MARK_BEGIN = '// @begin with-android-node-path';
const MARK_END = '// @end with-android-node-path';

const NODE_BLOCK = `${MARK_BEGIN}
    def NODE_EXE = {
        def fromEnv = System.getenv("NODE_BINARY")
        if (fromEnv != null && !fromEnv.trim().isEmpty()) {
            return fromEnv.trim()
        }
        def propsFile = new File(settingsDir, "local.properties")
        if (propsFile.exists()) {
            def props = new Properties()
            propsFile.withInputStream { stream -> props.load(stream) }
            def p = props.getProperty("node.executable")
            if (p != null && !p.trim().isEmpty()) {
                return p.trim()
            }
        }
        for (def candidate : ["/opt/homebrew/bin/node", "/usr/local/bin/node"]) {
            if (new File(candidate as String).exists()) {
                return candidate
            }
        }
        return "node"
    }()
${MARK_END}

`;

function patchSettingsGradle(contents) {
  if (contents.includes(MARK_BEGIN)) {
    if (contents.includes('commandLine("node"')) {
      return contents.replace(/commandLine\("node",/g, 'commandLine(NODE_EXE,');
    }
    return contents;
  }
  const anchor = /(pluginManagement\s*\{\s*\n)/;
  if (!anchor.test(contents)) {
    throw new Error('with-android-node-path: could not find pluginManagement { in settings.gradle');
  }
  let next = contents.replace(anchor, `$1${NODE_BLOCK}`);
  next = next.replace(/commandLine\("node",/g, 'commandLine(NODE_EXE,');
  return next;
}

function patchAppBuildGradle(contents) {
  if (contents.includes(MARK_BEGIN)) {
    if (contents.includes('["node",')) {
      return contents.replaceAll('["node",', '[NODE_EXE,');
    }
    return contents;
  }
  const injected = `${MARK_BEGIN}
apply from: new File(rootDir.parentFile, "node-path.gradle")
def NODE_EXE = ext.resolveNodeExecutable(rootDir.parentFile)
${MARK_END}

`;

  let next = injected + contents;
  next = next.replaceAll('["node",', '[NODE_EXE,');
  return next;
}

function copyNodePathGradle(projectRoot) {
  const src = path.join(projectRoot, 'plugins', 'node-path.gradle');
  const dest = path.join(projectRoot, 'android', 'node-path.gradle');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

/** Ensures Expo Kotlin plugins that hardcode `node` see nvm/Homebrew (reads local.properties). */
const GRADLEW_SH_BLOCK = [
  '# @begin farm-mobile-node-path',
  '# Expo Gradle plugins invoke bare `node`; Android Studio does not load nvm PATH.',
  'if [ -f "$APP_HOME/local.properties" ]; then',
  '  node_executable=$(grep \'^node\\.executable=\' "$APP_HOME/local.properties" 2>/dev/null | head -1 | cut -d= -f2-)',
  '  if [ -n "$node_executable" ] && [ -x "$node_executable" ]; then',
  '    export NODE_BINARY="$node_executable"',
  '    node_dir=$(dirname "$node_executable")',
  '    case ":$PATH:" in',
  '      *":$node_dir:"*) ;;',
  '      *) export PATH="$node_dir:$PATH" ;;',
  '    esac',
  '  fi',
  'fi',
  '# @end farm-mobile-node-path',
].join('\n');

function patchGradlew(contents) {
  if (contents.includes('# @begin farm-mobile-node-path')) {
    return contents;
  }
  const needle =
    'APP_HOME=$( cd -P "${APP_HOME:-./}" > /dev/null && printf \'%s\\n\' "$PWD" ) || exit\n\n# Use the maximum available, or set MAX_FD != -1 to use that value.';
  if (!contents.includes(needle)) {
    return contents;
  }
  return contents.replace(
    needle,
    [
      'APP_HOME=$( cd -P "${APP_HOME:-./}" > /dev/null && printf \'%s\\n\' "$PWD" ) || exit',
      '',
      GRADLEW_SH_BLOCK,
      '',
      '# Use the maximum available, or set MAX_FD != -1 to use that value.',
    ].join('\n'),
  );
}

const GRADLEW_BAT_BLOCK = [
  '@rem @begin farm-mobile-node-path',
  'for /f "usebackq tokens=1* delims==" %%A in (`findstr /b "node.executable=" "%APP_HOME%local.properties" 2^>nul`) do @if "%%A"=="node.executable" set "NODE_BINARY=%%B"',
  'if defined NODE_BINARY (',
  '  for %%I in ("%NODE_BINARY%") do set "FARM_NODE_DIR=%%~dpI"',
  '  set "PATH=%FARM_NODE_DIR%;%PATH%"',
  '  set "FARM_NODE_DIR="',
  ')',
  '@rem @end farm-mobile-node-path',
].join('\n');

function patchGradlewBat(contents) {
  if (contents.includes('@rem @begin farm-mobile-node-path')) {
    return contents;
  }
  const needle =
    'for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi\n\n@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.';
  if (!contents.includes(needle)) {
    return contents;
  }
  return contents.replace(
    needle,
    `for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

${GRADLEW_BAT_BLOCK}

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.`,
  );
}

/** @type {import('@expo/config-plugins').ConfigPlugin} */
module.exports = function withAndroidNodePath(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const androidDir = path.join(projectRoot, 'android');
      if (!fs.existsSync(androidDir)) {
        return cfg;
      }
      copyNodePathGradle(projectRoot);

      const settingsPath = path.join(androidDir, 'settings.gradle');
      if (fs.existsSync(settingsPath)) {
        let s = fs.readFileSync(settingsPath, 'utf8');
        s = patchSettingsGradle(s);
        fs.writeFileSync(settingsPath, s);
      }

      const appGradlePath = path.join(androidDir, 'app', 'build.gradle');
      if (fs.existsSync(appGradlePath)) {
        let s = fs.readFileSync(appGradlePath, 'utf8');
        s = patchAppBuildGradle(s);
        fs.writeFileSync(appGradlePath, s);
      }

      const localProps = path.join(androidDir, 'local.properties');
      const nodePath = process.execPath;
      let lines = [];
      if (fs.existsSync(localProps)) {
        lines = fs.readFileSync(localProps, 'utf8').split(/\r?\n/);
        lines = lines.filter((l) => !/^\s*node\.executable=/.test(l));
      }
      while (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      lines.push(`node.executable=${nodePath}`);
      fs.writeFileSync(localProps, lines.join('\n') + '\n');

      const gradlewPath = path.join(androidDir, 'gradlew');
      if (fs.existsSync(gradlewPath)) {
        let g = fs.readFileSync(gradlewPath, 'utf8');
        g = patchGradlew(g);
        fs.writeFileSync(gradlewPath, g);
      }
      const gradlewBatPath = path.join(androidDir, 'gradlew.bat');
      if (fs.existsSync(gradlewBatPath)) {
        let b = fs.readFileSync(gradlewBatPath, 'utf8');
        b = patchGradlewBat(b);
        fs.writeFileSync(gradlewBatPath, b);
      }

      return cfg;
    },
  ]);
};
