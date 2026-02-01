# Building a Custom React Hook for Form Validation: A Complete Guide

Have you ever found yourself drowning in a sea of `onChange` handlers and redundant error states? Form validation is a classic frontend pain point, but it doesn't have to be. In this tutorial, we'll build a custom `useForm` hook that is lightweight, type-safe, and incredibly easy to reuse.

![Final Result GIF](https://example.com/form-validation-demo.gif)

## Why Build a Custom Hook?

While libraries like Formik or React Hook Form are excellent, they can sometimes be overkill for smaller projects. Building your own hook allows you to:
1. **Understand the underlying logic** of state management.
2. **Minimize bundle size** by avoiding external dependencies.
3. **Customize the API** exactly to your team's needs.

## Prerequisites

- React 18.2+
- TypeScript 5.0+
- A basic understanding of React hooks (`useState`, `useCallback`).

## Step 1: Defining the Hook Skeleton

Let's start by defining our hook's signature and the basic state it will manage.

```tsx
import { useState, useCallback } from 'react';

interface ValidationRules {
  [key: string]: (value: any) => string | null;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  return { values, errors };
}
```

## Step 2: Implementing the Change Handler

Now, we need a way to update the values and trigger validation simultaneously.

```tsx
const handleChange = useCallback((name: keyof T, value: any) => {
  setValues(prev => ({ ...prev, [name]: value }));
  
  // Trigger validation for this specific field
  if (validationRules[name as string]) {
    const errorMessage = validationRules[name as string](value);
    setErrors(prev => ({
      ...prev,
      [name as string]: errorMessage || ''
    }));
  }
}, [validationRules]);
```

## Step 3: Adding the Submit Handler

A form isn't complete without a way to submit the data safely.

```tsx
const handleSubmit = (callback: (data: T) => void) => {
  return (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors: Record<string, string> = {};
    Object.keys(validationRules).forEach(key => {
      const error = validationRules[key](values[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length === 0) {
      callback(values);
    } else {
      setErrors(newErrors);
    }
  };
};
```

## Step 4: Putting it All Together

Here is the final implementation of our hook.

```tsx
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (validationRules[name as string]) {
      const error = validationRules[name as string](value);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  }, [validationRules]);

  const handleSubmit = (callback: (data: T) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    Object.keys(validationRules).forEach(key => {
      const error = validationRules[key](values[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) callback(values);
  };

  return { values, errors, handleChange, handleSubmit };
}
```

## Step 5: Usage Example

Let's see how easy it is to use this in a component.

```tsx
function LoginForm() {
  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    {
      email: (v) => (!v.includes('@') ? 'Invalid email' : null),
      password: (v) => (v.length < 6 ? 'Too short' : null),
    }
  );

  const onSubmit = (data) => console.log('Login Success:', data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input 
        value={values.email} 
        onChange={(e) => handleChange('email', e.target.value)} 
      />
      {errors.email && <p>{errors.email}</p>}
      
      <input 
        type="password"
        value={values.password} 
        onChange={(e) => handleChange('password', e.target.value)} 
      />
      {errors.password && <p>{errors.password}</p>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

## Conclusion

By building this custom hook, we've reduced our component's boilerplate significantly while maintaining full control over the validation logic. You can easily extend this hook to handle async validation, touched states, or form resetting.

Check out the full source code on [GitHub](https://github.com/example/react-useform-hook).

---

**Next Steps**: Try adding a `resetForm` function to the hook to clear all fields and errors!
