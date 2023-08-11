export function pickArg<T>(...args: Array<T>): T {
  return args[Math.floor(Math.random() * args.length)];
}
