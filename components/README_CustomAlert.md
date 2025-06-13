# Custom Branded Alert System

This custom alert system replaces the native `Alert.alert` with a branded modal that matches your app's design language.

## Components

### 1. CustomAlert Component (`components/CustomAlert.js`)
A fully customizable modal component with branded styling.

### 2. useCustomAlert Hook (`hooks/useCustomAlert.js`)
A convenient hook that manages alert state and provides easy-to-use methods.

## Usage

### Basic Implementation

```javascript
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

const YourScreen = () => {
  const {
    alertVisible,
    alertConfig,
    hideAlert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCelebration,
    showRest,
    showWorkout
  } = useCustomAlert();

  const handleSomeAction = () => {
    showSuccess(
      'Success!',
      'Your action was completed successfully.',
      [
        { text: 'OK', style: 'default', onPress: () => {} }
      ]
    );
  };

  return (
    <View>
      {/* Your screen content */}
      
      <CustomAlert
        visible={alertVisible}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        type={alertConfig.type}
      />
    </View>
  );
};
```

## Alert Types

The system supports different alert types with appropriate icons and styling:

- `default` - Basic information icon
- `success` - Green check circle
- `error` - Red close circle  
- `warning` - Orange alert circle
- `info` - Blue information icon
- `celebration` - Gold trophy icon
- `rest` - Orange timer icon
- `workout` - Black dumbbell icon

## Convenience Methods

### showSuccess(title, message, buttons)
```javascript
showSuccess('Great Job!', 'Exercise completed successfully!');
```

### showError(title, message, buttons)
```javascript
showError('Error', 'Something went wrong. Please try again.');
```

### showWarning(title, message, buttons)
```javascript
showWarning(
  'Are you sure?',
  'This action cannot be undone.',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: handleDelete }
  ]
);
```

### showCelebration(title, message, buttons)
```javascript
showCelebration(
  'Workout Complete! 🎉',
  'Amazing work! You completed all exercises.',
  [{ text: 'Continue', onPress: () => navigation.goBack() }]
);
```

### showRest(title, message, buttons)
```javascript
showRest(
  'Rest Time Over! 💪',
  'Ready for the next exercise?',
  [{ text: 'Let\'s Go!', onPress: startNextExercise }]
);
```

## Button Styles

- `default` - Black background with white text
- `cancel` - Light gray background with dark text
- `destructive` - Red background with white text

## Migration from Alert.alert

### Before:
```javascript
Alert.alert(
  'Workout Complete!',
  'Great job finishing your workout!',
  [
    { text: 'OK', onPress: () => navigation.goBack() }
  ]
);
```

### After:
```javascript
showCelebration(
  'Workout Complete!',
  'Great job finishing your workout!',
  [
    { text: 'OK', onPress: () => navigation.goBack() }
  ]
);
```

## Customization

You can customize the alert appearance by modifying the styles in `CustomAlert.js`:

- Colors
- Border radius
- Shadows
- Typography
- Icon sizes
- Button styling

## Implementation Checklist

To implement across your app:

1. ✅ Import `useCustomAlert` hook
2. ✅ Import `CustomAlert` component  
3. ✅ Add hook to component state
4. ✅ Replace `Alert.alert` calls with appropriate show methods
5. ✅ Add `<CustomAlert>` component to JSX
6. ✅ Remove `Alert` import if no longer needed

## Example Screens Already Updated

- ✅ WorkoutScreen.js
- ✅ PlansScreen.js (partial)

## Screens Still Need Updates

- [ ] FoodScreen.js
- [ ] MealSelectionScreen.js  
- [ ] ExerciseDetailScreen.js
- [ ] Any other screens using Alert.alert

This system provides a consistent, branded experience across your entire fitness app while maintaining the familiar Alert.alert API. 