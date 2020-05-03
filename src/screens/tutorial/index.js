import React, { useReducer } from 'react';
import { View, Text, Button } from 'react-native';

function reducer(state, action) {
  switch (action.type) {
    case 'create':
      return { todos: [...state.todos, action.todo] };
    case 'delete':
      return { todos: state.todos.filter((t) => t.id !== action.todo) };
    case 'clear':
      return { todos: [] };
    default:
      throw new Error();
  }
}

export default function TutorialScreen({ navigation }) {
  const [state, dispatch] = useReducer(reducer, { todos: [] });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title="Seguir"
        onPress={() => navigation.navigate({ name: 'InitialDeliveryAddressScreen' })}
      />
      <Button
        title="Crear"
        onPress={() => {
          dispatch({
            type: 'create',
            todo: { id: Date.now(), name: 'Limpiar la casa' },
          });
        }}
      />
      {state.todos.map((todo, index) => (
        <View key={index}>
          <Text>{todo.name}</Text>
          <Button
            title="Eliminar"
            onPress={() => {
              dispatch({
                type: 'delete',
                todo: todo.id,
              });
            }}
          />
        </View>
      ))}
      <Button
        title="Limpiar"
        onPress={() => {
          dispatch({
            type: 'clear',
          });
        }}
      />
    </View>
  );
}
