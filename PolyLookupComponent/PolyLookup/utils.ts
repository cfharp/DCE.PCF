import { sprintf } from "sprintf-js";
import { LanguagePack } from "./types/languagePack";

export function getPlaceholder(
  isAuthoringMode: boolean,
  formType: XrmEnum.FormType,
  outputSelectedItems: boolean,
  isDataLoading: boolean,
  isError: boolean,
  errorLookupView: Error | null,
  selectedCount: number,
  disabled: boolean,
  entityName: string | undefined,
  languagePack: LanguagePack,
  placeholder?: string
): string {
  if (isAuthoringMode) {
    if (placeholder) {
      return placeholder;
    }

    return "---";
  }

  if (formType === XrmEnum.FormType.Create) {
    if (!outputSelectedItems) {
      return languagePack.CreateFormNotSupportedMessage;
    }
  } else if (formType !== XrmEnum.FormType.Update) {
    return languagePack.ControlIsNotAvailableMessage;
  }

  if (isDataLoading) {
    return languagePack.LoadingMessage;
  }

  if (isError) {
    if (errorLookupView instanceof Error) {
      return languagePack.InvalidLookupViewMessage;
    }

    return languagePack.GenericErrorMessage;
  }

  if (selectedCount || disabled) {
    return "";
  }

  if (placeholder) {
    return placeholder;
  }

  return entityName ? sprintf(languagePack.PlaceholderLabel, entityName) : languagePack.PlaceholderDefault;
}
