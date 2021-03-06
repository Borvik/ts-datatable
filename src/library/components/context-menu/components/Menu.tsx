/* global: window */
import React, { Component, ReactNode } from 'react';
import { cx } from '../utils/cx';

import { cloneItem } from './cloneItem';
import { Portal } from './Portal';

import { HIDE_ALL, DISPLAY_MENU } from '../utils/actions';
import { styles } from '../utils/styles';
import { eventManager } from '../utils/eventManager';
import { TriggerEvent, StyleProps, MenuId } from '../types';
import { firstFocusable } from '../../../utils/firstFocusable';

const KEY = {
  ENTER: 13,
  ESC: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39
};

export interface MenuProps extends StyleProps {
  /**
   * Unique id to identify the menu. Use to Trigger the corresponding menu
   */
  id: MenuId;

  /**
   * Any valid node that can be rendered
   */
  children: ReactNode;

  /**
   * Theme is appended to `react-contexify__theme--${given theme}`.
   *
   * Built-in theme are `light` and `dark`
   */
  theme?: 'light' | 'dark';

  /**
   * Animation is appended to `.react-contexify__will-enter--${given animation}`
   *
   * Built-in animations are fade, flip, pop, zoom
   */
  animation?: 'fade' | 'flip' | 'pop' | 'zoom';

  /**
   * Invoked when the menu is shown.
   */
  onShown?: () => void;

  /**
   * Invoked when the menu is hidden.
   */
  onHidden?: () => void;

  /**
   * The render target of the menu
   */
  renderTarget?: () => HTMLElement | null

  position?: 'bottom-left'
}

interface MenuState {
  x: number;
  y: number;
  visible: boolean;
  nativeEvent: TriggerEvent;
  propsFromTrigger: object;
}

export class Menu extends Component<MenuProps, MenuState> {
  state = {
    x: 0,
    y: 0,
    visible: false,
    nativeEvent: {} as TriggerEvent,
    propsFromTrigger: {},
    onShown: null,
    onHidden: null
  };

  menuRef!: HTMLDivElement;
  unsub: (() => boolean)[] = [];

  componentDidMount() {
    this.unsub.push(eventManager.on(DISPLAY_MENU(this.props.id), this.show));
    this.unsub.push(eventManager.on(HIDE_ALL, this.hide));
  }

  componentWillUnmount() {
    this.unsub.forEach(cb => cb());
    this.unBindWindowEvent();
  }

  componentDidUpdate(_: Readonly<MenuProps>, prevState: Readonly<MenuState>) {
    if (this.state.visible !== prevState.visible) {
      if (this.state.visible && this.menuRef) {
        let firstFocusableEl = firstFocusable(this.menuRef);
        firstFocusableEl?.focus();
      } else if (!this.state.visible) {
        let menuProviderEl = document.getElementById(this.props.id);
        menuProviderEl?.focus();
      }

      if (this.state.visible && this.props.onShown) {
        this.props.onShown();
      } else if (!this.state.visible && this.props.onHidden) {
        this.props.onHidden();
      }
    }
  }

  bindWindowEvent = () => {
    window.addEventListener('resize', this.hide);
    window.addEventListener('contextmenu', this.hide);
    window.addEventListener('mousedown', this.hide);
    window.addEventListener('click', this.hide);
    window.addEventListener('scroll', this.hide);
    window.addEventListener('keydown', this.handleKeyboard);
  };

  unBindWindowEvent = () => {
    window.removeEventListener('resize', this.hide);
    window.removeEventListener('contextmenu', this.hide);
    window.removeEventListener('mousedown', this.hide);
    window.removeEventListener('click', this.hide);
    window.removeEventListener('scroll', this.hide);
    window.removeEventListener('keydown', this.handleKeyboard);
  };

  onMouseEnter = () => window.removeEventListener('mousedown', this.hide);

  onMouseLeave = () => window.addEventListener('mousedown', this.hide);

  hide = (event?: Event) => {
    // Safari trigger a click event when you ctrl + trackpad
    // Firefox:  trigger a click event when right click occur
    const e = event as KeyboardEvent & MouseEvent;

    if (
      typeof e !== 'undefined' &&
      (e.button === 2 || e.ctrlKey === true) &&
      e.type !== 'contextmenu'
    ) {
      return;
    }

    this.unBindWindowEvent();
    this.setState({ visible: false });
  };

  handleKeyboard = (e: KeyboardEvent) => {
    if (e.keyCode === KEY.ENTER || e.keyCode === KEY.ESC) {
      e.stopPropagation();
      this.unBindWindowEvent();
      this.setState({ visible: false });
    }
  };

  setRef = (ref: HTMLDivElement) => {
    this.menuRef = ref;
  };

  setMenuPosition() {
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const { offsetWidth: menuWidth, offsetHeight: menuHeight } = this.menuRef;
    let { x, y } = this.state;

    if (x + menuWidth > windowWidth) {
      x -= x + menuWidth - windowWidth;
    }

    if (y + menuHeight > windowHeight) {
      y -= y + menuHeight - windowHeight;
    }

    this.setState(
      {
        x,
        y
      },
      this.bindWindowEvent
    );
  }

  getMousePosition(e: TriggerEvent) {
    if (this.props.position) {
      let el = document.getElementById(this.props.id);
      if (el) {
        let elRect = el.getBoundingClientRect();
        return {
          x: elRect.left < 0 ? 0 : elRect.left,
          y: elRect.bottom < 0 ? 0 : elRect.bottom,
        };
      }
    }

    const pos = {
      x: e.clientX,
      y: e.clientY
    };

    if (
      e.type === 'touchend' &&
      (!pos.x || !pos.y) &&
      (e.changedTouches && e.changedTouches.length > 0)
    ) {
      pos.x = e.changedTouches[0].clientX;
      pos.y = e.changedTouches[0].clientY;
    }

    if (!pos.x || pos.x < 0) {
      pos.x = 0;
    }

    if (!pos.y || pos.y < 0) {
      pos.y = 0;
    }

    return pos;
  }

  show = (e: TriggerEvent, props: object) => {
    e.stopPropagation();
    eventManager.emit(HIDE_ALL);

    const { x, y } = this.getMousePosition(e);

    this.setState(
      {
        visible: true,
        x,
        y,
        nativeEvent: e,
        propsFromTrigger: props
      },
      this.setMenuPosition
    );
  };

  render() {
    const { theme, animation, style, className, children, renderTarget } = this.props;
    const { visible, nativeEvent, propsFromTrigger, x, y } = this.state;

    const cssClasses = cx(styles.menu, className, {
      [styles.theme + theme]: theme,
      [styles.animationWillEnter + animation]: animation
    });
    const menuStyle = {
      ...style,
      left: x,
      top: y + 1,
      opacity: 1
    };

    return (
      <Portal renderTarget={renderTarget}>
        {visible && (
          <div
            className={cssClasses}
            style={menuStyle}
            ref={this.setRef}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
          >
            <div>
              {cloneItem(children, {
                nativeEvent,
                propsFromTrigger
              })}
            </div>
          </div>
        )}
      </Portal>
    );
  }
}