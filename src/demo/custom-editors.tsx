import React from "react";
import { CustomEditorProps, CustomFilterEditorProps } from "../library";
import { Pokemon, query } from "./db";

interface DBPokemonType {
  name: string;
}

interface TypeEditorState {
  options: DBPokemonType[];
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
    const { value, setValue, row, column } = this.props;
    const { options } = this.state;
    
    return <select value={value} onChange={(e) => setValue(e.target.value)}>
      <option></option>
      {options.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
    </select>
  }
}