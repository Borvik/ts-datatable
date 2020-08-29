import React, { Component, ReactNode } from 'react';
import { cx } from '../utils/cx';

import { styles } from '../utils/styles';
import {
  MenuItemEventHandler,
  TriggerEvent,
  StyleProps,
  InternalProps
} from '../types';

export interface ItemProps extends StyleProps, InternalProps {
  /**
   * Any valid node that can be rendered
   */
  children: ReactNode;

  /**
   * Passed to the `Item` onClick callback. Accessible via `props`
   */
  data?: object;

  /**
   * Disable or not the `Item`. If a function is used, a boolean must be returned
   */
  disabled: boolean | ((args: MenuItemEventHandler) => boolean);

  /**
   * Callback when the current `Item` is clicked. The callback give you access to the current event and also the data passed
   * to the `Item`.
   * `({ event, props }) => ...`
   */
  onClick: (args: MenuItemEventHandler) => any;
}

const noop = () => {};

export class Item extends Component<ItemProps> {
  static defaultProps = {
    disabled: false,
    onClick: noop
  };

  isDisabled: boolean;

  constructor(props: ItemProps) {
    super(props);
    const { disabled, nativeEvent, propsFromTrigger, data } = this.props;

    this.isDisabled =
      typeof disabled === 'function'
        ? disabled({
            event: nativeEvent as TriggerEvent,
            props: { ...propsFromTrigger, ...data }
          })
        : disabled;
  }

  handleClick = (e: React.MouseEvent) => {
    this.isDisabled
      ? e.stopPropagation()
      : this.props.onClick({
          event: this.props.nativeEvent as TriggerEvent,
          props: { ...this.props.propsFromTrigger, ...this.props.data }
        });
  };

  handleEnter = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    
    this.isDisabled
      ? e.stopPropagation()
      : this.props.onClick({
          event: this.props.nativeEvent as TriggerEvent,
          props: { ...this.props.propsFromTrigger, ...this.props.data }
        });
  }

  render() {
    const { className, style, children } = this.props;

    const cssClasses = cx(styles.item, className, {
      [`${styles.itemDisabled}`]: this.isDisabled
    });

    return (
      <div
        className={cssClasses}
        style={style}
        onClick={this.handleClick}
        onKeyDown={this.handleEnter}
        role="presentation"
        tabIndex={0}
      >
        <div className={styles.itemContent}>{children}</div>
      </div>
    );
  }
}