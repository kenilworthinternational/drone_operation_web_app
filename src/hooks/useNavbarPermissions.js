import { useMemo } from 'react';
import { useGetMyPermissionsQuery } from '../api/services NodeJs/featurePermissionsApi';
import navbarCategories from '../config/navbarCategories';
import { getAllowedPaths, getCategoryVisibility, getUserData } from '../utils/authUtils';

const categories = navbarCategories;

/**
 * Shared navbar permission resolution (same rules as LeftNavBar).
 */
export function useNavbarPermissions() {
  const userData = getUserData();
  const { data: backendPermissions = {}, isLoading: loadingPermissions } = useGetMyPermissionsQuery(
    undefined,
    { skip: !userData?.id }
  );

  const backendCategoryPermissions = useMemo(() => {
    if (!backendPermissions || Object.keys(backendPermissions).length === 0) {
      return {};
    }
    let categoriesData = {};
    if (backendPermissions.categories) {
      categoriesData = backendPermissions.categories;
    } else {
      categoriesData = backendPermissions;
    }
    const categoryPerms = {};
    Object.keys(categoriesData).forEach((category) => {
      if (category === 'paths') return;
      const featureCodes = categoriesData[category];
      categoryPerms[category] = Array.isArray(featureCodes) && featureCodes.length > 0;
    });
    return categoryPerms;
  }, [backendPermissions]);

  const backendPathPermissions = useMemo(() => {
    if (!backendPermissions || Object.keys(backendPermissions).length === 0) {
      return {};
    }
    if (backendPermissions.paths) {
      return backendPermissions.paths;
    }
    return {};
  }, [backendPermissions]);

  const categoryVisibility = getCategoryVisibility(userData, backendCategoryPermissions, categories);
  const allowedPaths = getAllowedPaths(categoryVisibility, backendPathPermissions, userData);

  return {
    categories,
    categoryVisibility,
    allowedPaths,
    userData,
    loadingPermissions,
  };
}
