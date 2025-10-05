import type { Type } from "@glsl/types/types";
import type { MenuCategory, MenuItem } from "./interface";

export function filterItem(
  item: MenuItem,
  searchTermLowerCase: string,
  inputType?: Type
): boolean {
  if (searchTermLowerCase) {
    if (
      !item.name.toLowerCase().includes(searchTermLowerCase) &&
      !item.description?.toLowerCase().includes(searchTermLowerCase)
    ) {
      return false;
    }
  }
  if (inputType) {
    if (!item.filterBy(inputType)) return false;
  }
  return true;
}

export function getFilteredCategories(
  menuElements: MenuCategory[],
  searchTerm: string,
  inputType?: Type
) {
  const searchTermLower = searchTerm.toLowerCase();
  const filterItems = (items: MenuCategory["items"]) => {
    return items.filter((item) => filterItem(item, searchTermLower, inputType));
  };

  // TODO this should be memoized
  if (!searchTerm && !inputType) return menuElements;
  return menuElements
    .map((category) => ({
      ...category,
      items: filterItems(category.items),
    }))
    .filter((category) => category.items.length > 0);
}
