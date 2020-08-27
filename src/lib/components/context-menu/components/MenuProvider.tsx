import {
  Component,
  createElement,
  Children,
  cloneElement,
  isValidElement,
  ReactNode,
  SyntheticEvent,
  ReactElement
} from 'react';

import { DISPLAY_MENU } from '../utils/actions';
import { eventManager } from '../utils/eventManager';
import { MenuId, StyleProps } from '../types';

export interface MenuProviderProps extends StyleProps {
  /**
   * Unique id to identify the menu. Use to Trigger the corresponding menu
   */
  id: MenuId;

  /**
   * Any valid node that can be rendered
   */
  children: ReactNode;

  /**
   * Any valid node that can be rendered or a function returning a valid react node
   */
  component: ReactNode | ((args?: any) => ReactNode);

  /**
   * Render props
   */
  render?: (args?: any) => ReactNode;

  /**
   * Any react event
   * `onClick`, `onContextMenu`, ...
   */
  event: string;

  /**
   * Store children ref
   * `default: true`
   */
  storeRef: boolean;

  /**
   * Any valid object, data are passed to the menu item callback
   */
  data?: object;
}

export class MenuProvider extends Component<MenuProviderProps> {
  static defaultProps = {
    component: 'div',
    event: 'onContextMenu',
    storeRef: true
  };

  childrenRefs = [] as HTMLElement[];

  handleEvent = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    eventManager.emit(DISPLAY_MENU(this.props.id), e.nativeEvent, {
      ref:
        this.childrenRefs.length === 1
          ? this.childrenRefs[0]
          : this.childrenRefs,
      ...this.props.data
    });
  };

  setChildRef = (ref: HTMLElement) =>
    ref === null || this.childrenRefs.push(ref);

  getChildren() {
    // remove all the props specific to the provider
    const {
      id,
      component,
      event,
      children,
      className,
      style,
      storeRef,
      data,
      ...rest
    } = this.props;

    // reset refs
    this.childrenRefs = [];

    return Children.map(children, child =>
      isValidElement(child)
        ? cloneElement(child as ReactElement<any>, {
            ...rest,
            ...(storeRef ? { ref: this.setChildRef } : {})
          })
        : child
    );
  }

  render() {
    const { id, component, render, event, className, style } = this.props;
    const attributes = {
      [event]: this.handleEvent,
      className,
      style,
      id,
    };

    if (typeof render === 'function') {
      return render({ ...attributes, children: this.getChildren() });
    }

    return createElement(component as any, attributes, this.getChildren());
  }
}