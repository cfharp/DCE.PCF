import React from "react";
import { Root, createRoot } from "react-dom/client";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { IExtendedContext } from "./types/extendedContext";
import { LanguagePack } from "./types/languagePack";
import { IconSizes, LookdownControlProps, OpenRecordMode, ShowIconOptions } from "./types/typings";
import LookdownControl from "./components/LookdownControl";

export class Lookdown implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container: HTMLDivElement;
  private root: Root;
  private notifyOutputChanged: () => void;
  private output: ComponentFramework.LookupValue | null;
  private context: IExtendedContext;
  private languagePack: LanguagePack;

  /**
   * Empty constructor.
   */
  constructor() {
    // Empty constructor
  }

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: IExtendedContext,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this.context = context;
    this.container = container;
    this.languagePack = {
      BlankValueLabel: context.resources.getString("BlankValueLabel"),
      EmptyListMessage: context.resources.getString("EmptyListMessage"),
      OpenRecordLabel: context.resources.getString("OpenRecordLabel"),
      QuickCreateLabel: context.resources.getString("QuickCreateLabel"),
      LookupPanelLabel: context.resources.getString("LookupPanelLabel"),
      LoadDataErrorMessage: context.resources.getString("LoadDataErrorMessage"),
    };

    // Clear the container to avoid conflicts
    container.innerHTML = "";

    // Initialize React root
    this.root = createRoot(container, {
      identifierPrefix: "DCEPCF-Lookdown",
    });
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: IExtendedContext): void {
    this.context = context;
    this.render();
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {
      lookupField: this.output ? [this.output] : undefined,
    };
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
    this.root.unmount();
  }

  public render(): void {
    const isAuthoringMode = this.context.mode?.isAuthoringMode;
    const placeholder =
      this.context.parameters.placeholder?.raw ?? (this.context.mode.isAuthoringMode ? "---" : undefined);

    const props: LookdownControlProps = {
      lookupViewId: isAuthoringMode
        ? undefined
        : this.context.parameters.lookupField?.getViewId() ??
          this.context.utils._customControlProperties.descriptor.Parameters.DefaultViewId,
      lookupEntity: isAuthoringMode ? undefined : this.context.parameters.lookupField.getTargetEntityType(),
      selectedId: this.context.parameters.lookupField?.raw?.at(0)?.id,
      selectedText: this.context.parameters.lookupField?.raw?.at(0)?.name,
      customFilter: this.context.parameters.customFilter?.raw,
      groupBy: this.context.parameters.groupByField?.raw,
      optionTemplate: this.context.parameters.optionTemplate?.raw,
      selectedItemTemplate: this.context.parameters.selectedItemTemplate?.raw,
      placeholder: placeholder,
      showIcon: this.context.parameters.showIcon?.raw
        ? (Number.parseInt(this.context.parameters.showIcon.raw) as ShowIconOptions)
        : undefined,
      iconSize: this.context.parameters.iconSize?.raw
        ? (Number.parseInt(this.context.parameters.iconSize.raw) as IconSizes)
        : undefined,
      openRecordMode: this.context.parameters.commandOpenRecord?.raw
        ? (Number.parseInt(this.context.parameters.commandOpenRecord.raw) as OpenRecordMode)
        : undefined,
      allowQuickCreate: this.context.parameters.commandQuickCreate?.raw === "1",
      allowLookupPanel: this.context.parameters.commandQuickCreate?.raw === "1",
      disabled: this.context.mode.isControlDisabled,
      defaultLanguagePack: this.languagePack,
      languagePackPath: this.context.parameters.languagePackPath?.raw ?? undefined,
      fluentDesign: this.context.fluentDesignLanguage,
      onChange: (value) => {
        this.output = value;
        this.notifyOutputChanged();
      },
    };

    this.root.render(React.createElement(LookdownControl, props));
  }
}
