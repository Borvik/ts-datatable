import { PureComponent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  children: ReactNode;
  renderTarget?: () => HTMLElement | null;
}

interface State {
  canRender: boolean;
}

export class Portal extends PureComponent<Props, State> {
  state = {
    canRender: false
  };
  container = {} as HTMLDivElement;
  targetEl?: HTMLElement | null;

  componentDidMount() {
    this.container = document.createElement('div');
    this.renderContainer();
    this.setState({
      canRender: true
    });
  }

  componentWillUnmount() {
    this.targetEl?.removeChild(this.container);
  }

  componentDidUpdate(_prevProps: Props, _prevState: State) {
    this.renderContainer();
  }
  
  renderContainer() {
    const { renderTarget } = this.props;
    
    this.targetEl?.removeChild(this.container);
    this.targetEl = null;
    if (renderTarget) {
      this.targetEl = renderTarget();
    }
    if (!this.targetEl)
      this.targetEl = document.body;
    this.targetEl.appendChild(this.container);
  }
  
  render() {
    return (
      this.state.canRender && createPortal(this.props.children, this.container)
    );
  }
}