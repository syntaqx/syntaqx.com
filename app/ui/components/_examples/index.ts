// Generated alongside the files beside it: each registry item's examples,
// in the order its page shows them.
import type { ComponentType } from "react";
import ButtonVariants from "./button-variants";
import ButtonSizes from "./button-sizes";
import ButtonLoading from "./button-loading";
import CopyButtonDemo from "./copy-button-demo";
import LabelDemo from "./label-demo";
import FieldDemo from "./field-demo";
import FieldValid from "./field-valid";
import InputSizes from "./input-sizes";
import InputStates from "./input-states";
import TextareaDemo from "./textarea-demo";
import InputGroupDemo from "./input-group-demo";
import PasswordInputDemo from "./password-input-demo";
import NumberInputDemo from "./number-input-demo";
import ErrorSummaryDemo from "./error-summary-demo";
import RequirementListDemo from "./requirement-list-demo";
import HoverCardDemo from "./hover-card-demo";
import HoverCardGithub from "./hover-card-github";
import TimestampDemo from "./timestamp-demo";

export interface Example {
  slug: string;
  title: string;
  Component: ComponentType;
}

export const examples: Record<string, Example[]> = {
  button: [
    { slug: "button-variants", title: "Variants", Component: ButtonVariants },
    { slug: "button-sizes", title: "Sizes", Component: ButtonSizes },
    { slug: "button-loading", title: "Loading", Component: ButtonLoading },
  ],
  "copy-button": [{ slug: "copy-button-demo", title: "Icon and label", Component: CopyButtonDemo }],
  label: [{ slug: "label-demo", title: "With an input", Component: LabelDemo }],
  field: [
    { slug: "field-demo", title: "Label, description and error", Component: FieldDemo },
    { slug: "field-valid", title: "Success", Component: FieldValid },
  ],
  input: [
    { slug: "input-sizes", title: "Sizes", Component: InputSizes },
    { slug: "input-states", title: "States", Component: InputStates },
  ],
  textarea: [{ slug: "textarea-demo", title: "Grows with its content", Component: TextareaDemo }],
  "input-group": [
    { slug: "input-group-demo", title: "Icons, text and buttons", Component: InputGroupDemo },
  ],
  "password-input": [
    {
      slug: "password-input-demo",
      title: "Show, hide and Caps Lock",
      Component: PasswordInputDemo,
    },
  ],
  "number-input": [{ slug: "number-input-demo", title: "Bounded", Component: NumberInputDemo }],
  "error-summary": [
    { slug: "error-summary-demo", title: "Two problems", Component: ErrorSummaryDemo },
  ],
  "requirement-list": [
    {
      slug: "requirement-list-demo",
      title: "Ticked off as they're met",
      Component: RequirementListDemo,
    },
  ],
  "hover-card": [
    { slug: "hover-card-demo", title: "Preview on intent", Component: HoverCardDemo },
    {
      slug: "hover-card-github",
      title: "Loading on intent: GitHub profiles",
      Component: HoverCardGithub,
    },
  ],
  timestamp: [{ slug: "timestamp-demo", title: "In running text", Component: TimestampDemo }],
};
