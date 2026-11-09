// Content type is independent of franchise theme and provenance.
export const MATERIAL_IDS = ["all", "equipment"];
export function isWeaponAsset(id, mod) {
  const tags=mod.meta?.tags??[];
  const category=id.split("/")[0];
  if(category==="ui")return false;
  return id.startsWith("weapons/") || id.startsWith("thrown/")
    || tags.some(tag=>["weapon","equipment","thrown"].includes(tag))
    || ((["moves","melee","dnf"].includes(category)||tags.some(tag=>["sword","bow","arrow","spear","katana","gun","launcher"].includes(tag)))
      && (mod.act?.poses??[]).some(([,pose])=>pose.weapon||pose.offWeapon));
}
export const matchesMaterial = (material,id,mod) => material!=="equipment" || isWeaponAsset(id,mod);
