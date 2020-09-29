## Dialogs

This is a reference for the internal use of how to show a dialog, and a precursor to how a form _might_ work.  The dialog is in actual use in the project, the form example is more of a proof-of-concept for another application and is incomplete.

```tsx
function pageComponent() {
  /**
   * EditDialog is the form component taking the data to use in it.
   * It doesn't _actually_ get rendered at this point (console.log
   * confirmed within EditDialog).
   * 
   * `dialog` - if open, will contain the rendered dialog - wrapped with a DialogContext and a dialog element. THIS is what should be rendered.
   * 
   * `showDialog` a function that returns a promise, which completes when the dialog is closed.
   */
  const {dialog, showDialog} = useDialog(<EditDialog data={{}} />);

  return (
    <div>
      {dialog}
      <button type='button' onClick={async () => {
        // Could do a "setState" here so <EditDialog data> actually has data.
        let result = await showDialog();
        // Result should be `undefined` if dialog was canceled
      }}>Show Dialog</button>
    </div>
  );
}


// The EditDialog component:
export const EditDialog: React.FC<{data?: FormState}> = (props) => {
  // `useFormState` is a custom hook for keeping an empty state for unchanged form data, but allowing the variable to contain the full set of data merged with the state.
  const [form, setForm] = useFormState<FormState>(props.data ?? {
    first_name: '',
    last_name: '',
  });

  // `onSubmit` - if set, contents are wrapped in a form, if not
  //    any change must be handled completely here 
  return <Dialog onSubmit={async (close) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // not really sure _how_ to handle errors yet
    if (form.first_name === 'fail')
      throw new Error('test');
    close(form);
  }}>
    <div>
      <label>First Name:</label>
      <input value={form.first_name ?? ''} onChange={(e) => setForm({ first_name: e.target.value })} />
    </div>
    <div>
      <label>Last Name:</label>
      <input value={form.last_name ?? ''} onChange={(e) => setForm({ last_name: e.target.value })} />
    </div>
    <div>
      <button type='button'>Close</button>
      <button type='submit'>Submit</button>
    </div>
  </Dialog>;
}
```