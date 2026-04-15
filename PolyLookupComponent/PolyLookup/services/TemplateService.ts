import Handlebars from "handlebars";
/**
 * Getting the variables from the Handlebars template.
 * Supports helpers too.
 * @param input
 */
export function getHandlebarsVariables(input: string): string[] {
  const ast = Handlebars.parseWithoutProcessing(input);
  const variables = new Set<string>();
  const builtInHelpers = ['if', 'each', 'with', 'unless', 'log', 'lookup'];

  function walk(node: any) {
    if (!node) return;

    if (node.type === 'MustacheStatement' || node.type === 'BlockStatement') {
      const name = node.path.original;

      // Only add if it's NOT a registered helper or a built-in helper
      if (!Handlebars.helpers[name] && !builtInHelpers.includes(name)) {
        variables.add(name);
      }
    }

    if (node.params) {
      node.params.forEach((param: any) => {
        if (param.type === 'PathExpression') {
          variables.add(param.original);
        }
      });
    }

    // Recursively walk through nested programs (bodies of #if, #each, etc.)
    if (node.program) walk(node.program);
    if (node.inverse) walk(node.inverse);
    if (node.body) node.body.forEach(walk);
  }

  walk(ast);
  return Array.from(variables);
}

/**
 * Register helpers
 */
export function registerHandlebarsHelpers() {
  Handlebars.registerHelper('ifEquals', function (this: any, arg1: any, arg2: any, options: any) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("ifIn", function (this: any, arg1: any, list: any[], options: any) {
    return (list?.indexOf(arg1) > -1) ? options.fn(this) : options.inverse(this);
  });
}