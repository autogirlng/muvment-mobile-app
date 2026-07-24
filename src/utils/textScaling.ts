import {
  Text,
  TextInput,
  type TextInputProps,
  type TextProps,
} from "react-native";

const APP_MAX_FONT_SIZE_MULTIPLIER = 1.3;

type ComponentWithDefaultProps<TProps> = {
  defaultProps?: Partial<TProps>;
};

export const configureTextScaling = () => {
  const textComponent = Text as unknown as ComponentWithDefaultProps<TextProps>;
  const textInputComponent =
    TextInput as unknown as ComponentWithDefaultProps<TextInputProps>;

  textComponent.defaultProps = {
    ...textComponent.defaultProps,
    allowFontScaling: true,
    maxFontSizeMultiplier: APP_MAX_FONT_SIZE_MULTIPLIER,
  };

  textInputComponent.defaultProps = {
    ...textInputComponent.defaultProps,
    allowFontScaling: true,
    maxFontSizeMultiplier: APP_MAX_FONT_SIZE_MULTIPLIER,
  };
};
