export function assertSameTypes<T extends Type>(type1: T, type2: Type): asserts type2 is T {
  if (type1.id !== type2.id) {
    throw new Error(`Expected type ${type1.id}, but got ${type2.id}`);
  }
}