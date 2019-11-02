import { useContext, useEffect, useState } from 'react';
import {
  NavigationScreenProp,
  NavigationRoute,
  NavigationContext,
  NavigationEventPayload,
  EventType,
  NavigationEventCallback,
} from 'react-navigation';
import { BackHandler, Dimensions } from 'react-native';
import * as Yup from 'yup';

export const useNavigation = <Params extends {}>() => {
  return useContext(NavigationContext) as NavigationScreenProp<
    NavigationRoute,
    Params
  >;
};

interface FocusState {
  isFocused: boolean;
  isBlurring: boolean;
  isBlurred: boolean;
  isFocusing: boolean;
}

const emptyFocusState: FocusState = {
  isFocused: false,
  isBlurring: false,
  isBlurred: false,
  isFocusing: false,
};

const didFocusState = { ...emptyFocusState, isFocused: true };
const willBlurState = { ...emptyFocusState, isBlurring: true };
const didBlurState = { ...emptyFocusState, isBlurred: true };
const willFocusState = { ...emptyFocusState, isFocusing: true };
const getInitialFocusState = (isFocused: boolean) =>
  isFocused ? didFocusState : didBlurState;
const focusStateOfEvent = (eventName: EventType): FocusState => {
  switch (eventName) {
    case 'didFocus':
      return didFocusState;
    case 'willFocus':
      return willFocusState;
    case 'willBlur':
      return willBlurState;
    case 'didBlur':
      return didBlurState;
    default:
      return emptyFocusState;
  }
};

export const useNavigationEvents = (
  handleEvt: NavigationEventCallback
): void => {
  const navigation = useNavigation();
  useEffect(() => {
    const subsA = navigation.addListener('action' as any, handleEvt);
    const subsWF = navigation.addListener('willFocus', handleEvt);
    const subsDF = navigation.addListener('didFocus', handleEvt);
    const subsWB = navigation.addListener('willBlur', handleEvt);
    const subsDB = navigation.addListener('didBlur', handleEvt);
    return () => {
      subsA.remove();
      subsWF.remove();
      subsDF.remove();
      subsWB.remove();
      subsDB.remove();
    };
  });
};

export const useFocusState = <Params extends {}>(): FocusState => {
  const navigation = useNavigation<Params>();
  const isFocused: boolean = navigation.isFocused();
  const [focusState, setFocusState] = useState<FocusState>(
    getInitialFocusState(isFocused)
  );
  const handleEvent = (e: NavigationEventPayload): void => {
    const newState = focusStateOfEvent(e.type);
    if (newState) {
      setFocusState(newState);
    }
  };
  useNavigationEvents(handleEvent);
  return focusState;
};

export const unreachableAssertion = (input: never, message?: string): never => {
  throw new Error(message || 'Unreachable code.');
};

export const useNoBackButtonAndroid = (): void => {
  useEffect((): (() => void) => {
    const handleBack = (): boolean => true;
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return (): void => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);
};

export const cognitoPasswordYupString = Yup.string()
  .min(8) //  Must be minimum of length eight.
  .matches(/[A-Za-z]/) // Must contain letter.
  .matches(/[0-9]/) // Must contain number.
  .matches(/^\S+$/) // No whitespace.
  .matches(/[\^$*.[\]{}()?\-"!@#%&/,><':;|_~`]/) // Must contain special.
  .required();

export const percentageHeight = (percent: number): number =>
  Math.round((Dimensions.get('window').height * percent) / 100);

export const percentageWidth = (percent: number): number =>
  Math.round((Dimensions.get('window').width * percent) / 100);
