// One complete texel source per existing weapon, shared by held and standalone views.
import {ORNATE_BLADES} from "./ornate-blades.js";
import {ORNATE_EQUIPMENT} from "./ornate-equipment.js";
import {ORNATE_PROPS} from "./ornate-props.js";
import {DNF_WEAPON_SHAPES} from "./dnf-weapons.js";

export const ORNATE_MELEE_SHAPES=Object.freeze({
  ...Object.fromEntries(Object.entries(ORNATE_BLADES).filter(([id])=>id!=="flying-sword")),
  ...ORNATE_EQUIPMENT,handle:ORNATE_PROPS.handle,
  "blood-cleaver":DNF_WEAPON_SHAPES["blood-cleaver"],"chain-blade":DNF_WEAPON_SHAPES["chain-blade"],
});
export const ORNATE_THROWN_SHAPES=Object.freeze({
  ...Object.fromEntries(Object.entries(ORNATE_PROPS).filter(([id])=>id!=="handle")),
  "flying-sword":ORNATE_BLADES["flying-sword"],"hell-cannon":DNF_WEAPON_SHAPES["hell-cannon"],
});
