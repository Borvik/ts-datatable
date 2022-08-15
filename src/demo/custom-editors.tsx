import React from "react";
import { CustomEditorProps, CustomFilterEditorProps, EditorWrapperProps } from "../library";
import { Pokemon, query } from "./db";
import { createMultiSelect } from "./multi-select";

interface DBPokemonType {
  name: string;
}

interface TypeEditorState {
  options: DBPokemonType[];
}

export class CustomMultiTypeFilterEditor extends React.Component<CustomFilterEditorProps, TypeEditorState> {
  state = {
    options: [] as DBPokemonType[]
  }

  el: HTMLSelectElement | null = null;
  prevEl: HTMLSelectElement | null = null;

  constructor(props: CustomFilterEditorProps) {
    super(props);

    this.changeRef = this.changeRef.bind(this);
  }

  componentDidMount() {
    // initialize dropdown
    let types: DBPokemonType[] = query('SELECT * FROM pokemon_types;');
    this.setState({ options: types });
  }

  componentWillUnmount() {
    this.clearMultiselect();
  }

  clearMultiselect() {
    // @ts-ignore
    if (!!this.el && typeof this.el.destory_multiselect === 'function') {
      // @ts-ignore
      this.el.destory_multiselect();
    }

    // @ts-ignore
    let div: HTMLDivElement | null | undefined = this.el?.multiselectdiv;
    if (div) {
      div.remove();
    }

    this.props.inputRef.current = null;
  }

  changeRef(el: HTMLSelectElement | null) {
    if (this.el !== el) {
      // unload prev
      this.clearMultiselect();
      this.prevEl = this.el;
    }

    this.el = el;
    if (!!el) {
      // @ts-ignore
      if (typeof el.loadOptions !== 'function') {
        createMultiSelect(el);

        // @ts-ignore
        this.props.inputRef.current = el.multiselectdiv;
      }
    }
  }

  render() {
    const { value, setValue, editorOptions } = this.props;
    const { options } = this.state; //

    const allOptions = (editorOptions?.additionalOptions ?? []).concat(options);

    return <select value={value ?? []} onChange={(e) => {
      let selOptions = Array.from(e.target.selectedOptions).map(o => o.value);
      setValue(selOptions);
    }} multiple ref={this.changeRef}>
      {allOptions.map(t => {
        return <option key={t.name} value={t.name}>{t.name}</option>
      })}
    </select>
  }
}

export class CustomTypeSelectEditor extends React.Component<CustomFilterEditorProps, TypeEditorState> {
  state = {
    options: [] as DBPokemonType[]
  }

  componentDidMount() {
    let types: DBPokemonType[] = query('SELECT * FROM pokemon_types;');
    this.setState({ options: types });
  }
  render() {
    const { inputRef, value, allValues, setValue, onLoseFocus, editorOptions } = this.props;
    const { options } = this.state;

    const allOptions = (editorOptions.additionalOptions ?? []).concat(options);
    
    let hideable = Array.isArray(allValues);
    return <select ref={(el) => inputRef.current = el} value={value ?? ''} onBlur={onLoseFocus} onChange={(e) => setValue(e.target.value)}>
      <option></option>
      {allOptions.map(t => {
        if (hideable && value !== t.name && allValues.includes(t.name))
          return null;
        return <option key={t.name} value={t.name}>{t.name}</option>
      }).filter(e => !!e)}
    </select>
  }
}

export class CustomTypeColumnEditor extends React.Component<CustomEditorProps<Pokemon>, TypeEditorState> {
  state = {
    options: [] as DBPokemonType[]
  }

  componentDidMount() {
    let types: DBPokemonType[] = query('SELECT * FROM pokemon_types;');
    this.setState({ options: types });
  }

  render() {
    // don't warn on unused row/column
    // eslint-disable-next-line
    const { value, setValue, row, column, editMode, autoSave } = this.props;
    const { options } = this.state;
    
    return <select value={value} onChange={(e) => setValue(e.target.value)} onBlur={editMode === 'autosave' ? autoSave : undefined}>
      <option></option>
      {options.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
    </select>
  }
}

export class CustomInputWrapper extends React.Component<EditorWrapperProps<Pokemon>> {
  render() {
    const { value, children } = this.props;
    return <>
      <div>{children}</div>
      <div>{value}</div>
    </>
  }
}