This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Dialogs

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