import { TextField as RadixTextField } from "@radix-ui/themes";
import { PropsWithChildren } from "react";
import classNames from "classnames";

import styles from "./TextField.module.css";

type Props = PropsWithChildren &
  Omit<RadixTextField.RootProps, "aria-invalid"> & {
    isInvalid?: boolean;
  };

function TextFieldElement(props: Props) {
  const { children, isInvalid, className, ...rest } = props;

  return (
    <RadixTextField.Root
      className={classNames(
        styles.textField,
        { [styles.invalid]: isInvalid },
        className
      )}
      aria-invalid={isInvalid}
      {...rest}
    >
      {children}
    </RadixTextField.Root>
  );
}

export const TextField = Object.assign(TextFieldElement, {
  Slot: RadixTextField.Slot,
});
