'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  AppState,
  ScreenName,
  SourceData,
  OracleData,
  Message,
  TuteeState,
  GradingData,
} from '@/lib/types';

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState: AppState = {
  currentScreen: 'upload',
  createdAt: new Date(),
  source: {
    sourceText: '',
    sourceType: 'text',
    subtopic: '',
    characterCount: 0,
  },
  oracle: null,
  conversation: {
    messages: [],
    coveredSubtopics: [],
    tuteeState: 'idle',
    messageCount: 0,
    startedAt: null,
    endedAt: null,
  },
  grading: null,
};

// ---------------------------------------------------------------------------
// Action Types
// ---------------------------------------------------------------------------

type Action =
  | { type: 'SET_SCREEN'; screen: ScreenName }
  | { type: 'SET_SOURCE_DATA'; data: Partial<SourceData> }
  | { type: 'SET_ORACLE_DATA'; data: OracleData }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'UPDATE_TUTEE_STATE'; tuteeState: TuteeState }
  | { type: 'UPDATE_COVERED_SUBTOPICS'; subtopics: string[] }
  | { type: 'END_CONVERSATION' }
  | { type: 'SET_GRADING_DATA'; data: GradingData }
  | { type: 'RESET_SESSION' };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function sessionReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.screen };

    case 'SET_SOURCE_DATA':
      return {
        ...state,
        source: { ...state.source, ...action.data },
      };

    case 'SET_ORACLE_DATA':
      return { ...state, oracle: action.data };

    case 'ADD_MESSAGE':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: [...state.conversation.messages, action.message],
          messageCount: state.conversation.messageCount + 1,
          startedAt: state.conversation.startedAt ?? new Date(),
        },
      };

    case 'UPDATE_TUTEE_STATE':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          tuteeState: action.tuteeState,
        },
      };

    case 'UPDATE_COVERED_SUBTOPICS':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          coveredSubtopics: action.subtopics,
        },
      };

    case 'END_CONVERSATION':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          endedAt: new Date(),
        },
      };

    case 'SET_GRADING_DATA':
      return { ...state, grading: action.data };

    case 'RESET_SESSION':
      return { ...initialState, createdAt: new Date() };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SessionContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      'useSession() must be used within a <SessionProvider>. ' +
        'Wrap your component tree with <SessionProvider> to fix this error.',
    );
  }

  const { state, dispatch } = context;

  const setScreen = useCallback(
    (screen: ScreenName) => dispatch({ type: 'SET_SCREEN', screen }),
    [dispatch],
  );

  const setSourceData = useCallback(
    (data: Partial<SourceData>) => dispatch({ type: 'SET_SOURCE_DATA', data }),
    [dispatch],
  );

  const setOracleData = useCallback(
    (data: OracleData) => dispatch({ type: 'SET_ORACLE_DATA', data }),
    [dispatch],
  );

  const addMessage = useCallback(
    (message: Message) => dispatch({ type: 'ADD_MESSAGE', message }),
    [dispatch],
  );

  const updateTuteeState = useCallback(
    (tuteeState: TuteeState) =>
      dispatch({ type: 'UPDATE_TUTEE_STATE', tuteeState }),
    [dispatch],
  );

  const updateCoveredSubtopics = useCallback(
    (subtopics: string[]) =>
      dispatch({ type: 'UPDATE_COVERED_SUBTOPICS', subtopics }),
    [dispatch],
  );

  const endConversation = useCallback(
    () => dispatch({ type: 'END_CONVERSATION' }),
    [dispatch],
  );

  const setGradingData = useCallback(
    (data: GradingData) => dispatch({ type: 'SET_GRADING_DATA', data }),
    [dispatch],
  );

  const resetSession = useCallback(
    () => dispatch({ type: 'RESET_SESSION' }),
    [dispatch],
  );

  return {
    state,
    setScreen,
    setSourceData,
    setOracleData,
    addMessage,
    updateTuteeState,
    updateCoveredSubtopics,
    endConversation,
    setGradingData,
    resetSession,
  };
}
