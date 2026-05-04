/**
 * Adds a "Start Metro" pre-action to the iOS scheme so pressing Run in Xcode
 * automatically opens a new Terminal window running `expo start --dev-client`
 * (idempotent — skipped if port 8081 is already busy).
 *
 * Patches: ios/<Project>.xcodeproj/xcshareddata/xcschemes/<Project>.xcscheme
 * by wrapping the existing <BuildAction> with a <PreActions> block that
 * invokes scripts/xcode-start-metro.sh from the project root.
 *
 * Idempotent: looks for a sentinel comment before re-injecting on prebuild.
 */
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const SENTINEL = 'farm-mobile-metro-launcher';

function buildPreActionsBlock(blueprintIdentifier, blueprintName, containerName) {
  // The shell script we run. Single-quoted path is safe because the script
  // itself only references env vars and absolute tool paths.
  // We deliberately run the launcher SYNCHRONOUSLY (no `&`). The launcher
  // itself decides when to return — fast (no-op) if Metro is already up,
  // otherwise it polls port 8081 with a 45s ceiling so the build doesn't hang.
  const scriptText = [
    '# ' + SENTINEL,
    'SCRIPT="$SRCROOT/../scripts/xcode-start-metro.sh"',
    'if [ -x "$SCRIPT" ]; then',
    '  "$SCRIPT" || true',
    'fi',
    'exit 0',
  ].join('\n');

  // XML-escape the script body for the scriptText attribute.
  const xmlEscaped = scriptText
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '&#10;');

  return [
    '   <!-- ' + SENTINEL + ' -->',
    '   <PreActions>',
    '      <ExecutionAction',
    '         ActionType = "Xcode.IDEStandardExecutionActionsCore.ExecutionActionType.ShellScriptAction">',
    '         <ActionContent',
    '            title = "Start Metro"',
    '            scriptText = "' + xmlEscaped + '"',
    '            shellToInvoke = "/bin/bash">',
    '            <EnvironmentBuildable>',
    '               <BuildableReference',
    '                  BuildableIdentifier = "primary"',
    '                  BlueprintIdentifier = "' + blueprintIdentifier + '"',
    '                  BuildableName = "' + blueprintName + '.app"',
    '                  BlueprintName = "' + blueprintName + '"',
    '                  ReferencedContainer = "container:' + containerName + '">',
    '               </BuildableReference>',
    '            </EnvironmentBuildable>',
    '         </ActionContent>',
    '      </ExecutionAction>',
    '   </PreActions>',
  ].join('\n');
}

function patchScheme(contents) {
  if (contents.includes(SENTINEL)) {
    return { contents, changed: false };
  }

  // Pull the primary BuildableReference out of the existing BuildAction so
  // the pre-action's EnvironmentBuildable points at the same target.
  const refMatch = contents.match(
    /<BuildAction[\s\S]*?<BuildableReference[\s\S]*?BlueprintIdentifier\s*=\s*"([^"]+)"[\s\S]*?BuildableName\s*=\s*"([^"]+)\.app"[\s\S]*?BlueprintName\s*=\s*"([^"]+)"[\s\S]*?ReferencedContainer\s*=\s*"container:([^"]+)"/,
  );
  if (!refMatch) {
    throw new Error(
      'with-ios-metro-launcher: could not find primary BuildableReference inside BuildAction',
    );
  }
  const [, blueprintIdentifier, , blueprintName, containerName] = refMatch;

  const block = buildPreActionsBlock(blueprintIdentifier, blueprintName, containerName);

  // Inject just after the opening <BuildAction ...> tag, before its first child.
  const next = contents.replace(
    /(<BuildAction[^>]*>\s*)(<BuildActionEntries>)/,
    `$1\n${block}\n      $2`,
  );
  if (next === contents) {
    throw new Error(
      'with-ios-metro-launcher: failed to inject <PreActions> before <BuildActionEntries>',
    );
  }
  return { contents: next, changed: true };
}

function findSchemeFile(iosDir) {
  const xcshared = path.join(iosDir);
  const projects = fs
    .readdirSync(xcshared)
    .filter((name) => name.endsWith('.xcodeproj'));
  for (const proj of projects) {
    const schemesDir = path.join(xcshared, proj, 'xcshareddata', 'xcschemes');
    if (!fs.existsSync(schemesDir)) continue;
    const schemes = fs
      .readdirSync(schemesDir)
      .filter((name) => name.endsWith('.xcscheme'));
    if (schemes.length > 0) {
      // Prefer a scheme matching the project name (FarmOS.xcscheme for FarmOS.xcodeproj).
      const projBase = proj.replace(/\.xcodeproj$/, '');
      const preferred = schemes.find((s) => s === `${projBase}.xcscheme`);
      return path.join(schemesDir, preferred ?? schemes[0]);
    }
  }
  return null;
}

/** @type {import('@expo/config-plugins').ConfigPlugin} */
module.exports = function withIosMetroLauncher(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const iosDir = path.join(projectRoot, 'ios');
      if (!fs.existsSync(iosDir)) {
        return cfg;
      }
      const schemePath = findSchemeFile(iosDir);
      if (!schemePath) {
        return cfg;
      }
      const original = fs.readFileSync(schemePath, 'utf8');
      const { contents, changed } = patchScheme(original);
      if (changed) {
        fs.writeFileSync(schemePath, contents);
      }
      return cfg;
    },
  ]);
};
