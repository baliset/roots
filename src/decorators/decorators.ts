export function deprecate(target: Function, context:any) {
  if (context.kind === "method") {
    return function (...args: any[]) {
      console.log(`${context.name} is deprecated and will be removed in a future version.`);
      //@ts-ignore
      return target.apply(this, args);
    }
  }
}
