const UI_BLOCK =
  "a, button, input, textarea, label, select, [data-no-shot], [role='button']";

export function isUiTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(UI_BLOCK));
}
