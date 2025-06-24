import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NLUDisplay, VoiceRecognitionCard } from '../../src/components/AdvancedMobileFeatures'; // Adjust path as necessary
import { Text } from 'react-native'; // Mock Icon if not already handled globally

// Mock Icon component as it's used in VoiceRecognitionCard and not relevant to NLUDisplay logic
jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const MockIcon = ({ name, size, color }) => <Text>{`Icon:${name}`}</Text>;
  return MockIcon;
});

// Mock Animated components as they are not the focus of these unit tests
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    View: (props) => <div {...props} />, // Render as a simple div or View
    timing: () => ({
      start: (callback) => { if (callback) callback({ finished: true }); },
    }),
    loop: (animation) => ({
      start: () => {},
      stop: () => {},
    }), // Mock loop function
  };
});


describe('NLUDisplay Component', () => {
  const mockDetailsBase = {
    intent: 'TEST_INTENT',
    entities: { entity1: 'value1', entity2: 'value2' },
    originalQuery: 'This is a test query',
    confidence: 0.95,
  };

  test('renders null if no details are provided', () => {
    render(<NLUDisplay details={null} />);
    expect(screen.queryByText('Voice Command Details:')).toBeNull();
  });

  test('renders all details correctly when provided', () => {
    render(<NLUDisplay details={mockDetailsBase} />);
    expect(screen.getByText('Voice Command Details:')).toBeTruthy();
    expect(screen.getByText(/You said:/)).toHaveTextContent(`You said: "${mockDetailsBase.originalQuery}"`);
    expect(screen.getByText(/Intent:/)).toHaveTextContent(`Intent: ${mockDetailsBase.intent}`);
    expect(screen.getByText(/Confidence:/)).toHaveTextContent(`Confidence: ${Math.round(mockDetailsBase.confidence * 100)}%`);
    expect(screen.getByText('Entities:')).toBeTruthy();
    expect(screen.getByText(/- entity1: value1/)).toBeTruthy();
    expect(screen.getByText(/- entity2: value2/)).toBeTruthy();
  });

  test('renders correctly if optional fields (originalQuery, confidence) are missing', () => {
    const detailsWithoutOptional = {
      intent: 'MINIMAL_INTENT',
      entities: { item: 'sample' },
    };
    render(<NLUDisplay details={detailsWithoutOptional} />);
    expect(screen.getByText('Voice Command Details:')).toBeTruthy();
    expect(screen.getByText(/Intent:/)).toHaveTextContent(`Intent: ${detailsWithoutOptional.intent}`);
    expect(screen.queryByText(/You said:/)).toBeNull();
    expect(screen.queryByText(/Confidence:/)).toBeNull();
    expect(screen.getByText('Entities:')).toBeTruthy();
    expect(screen.getByText(/- item: sample/)).toBeTruthy();
  });

  test('renders correctly if entities are empty or not provided', () => {
    const detailsWithoutEntities = {
      intent: 'NO_ENTITY_INTENT',
      originalQuery: 'Query without entities',
      confidence: 0.88,
    };
    render(<NLUDisplay details={detailsWithoutEntities} />);
    expect(screen.getByText('Voice Command Details:')).toBeTruthy();
    expect(screen.queryByText('Entities:')).toBeNull();

    const detailsWithEmptyEntities = {
      ...detailsWithoutEntities,
      entities: {},
    };
    render(<NLUDisplay details={detailsWithEmptyEntities} />);
    expect(screen.getByText('Voice Command Details:')).toBeTruthy();
    expect(screen.queryByText('Entities:')).toBeNull();
  });

  test('renders complex entity values as JSON string', () => {
    const detailsWithComplexEntity = {
      intent: 'COMPLEX_ENTITY_INTENT',
      entities: { user: { name: 'Jules', id: 1 } },
    };
    render(<NLUDisplay details={detailsWithComplexEntity} />);
    expect(screen.getByText('Entities:')).toBeTruthy();
    expect(screen.getByText(/- user: {"name":"Jules","id":1}/)).toBeTruthy();
  });
});

describe('VoiceRecognitionCard Component', () => {
  const mockNluDetails = {
    intent: 'NAVIGATE',
    entities: { screen: 'Home' },
    originalQuery: 'Go home',
    confidence: 0.99,
  };

  const mockProps = {
    active: false,
    onStart: jest.fn(),
    onStop: jest.fn(),
    onTestCommand: jest.fn(),
    pulseAnim: { /* mock pulseAnim if necessary, but NLUDisplay doesn't use it */ },
  };

  test('does not render NLUDisplay if nluDetails is null', () => {
    render(<VoiceRecognitionCard {...mockProps} nluDetails={null} />);
    expect(screen.queryByText('Voice Command Details:')).toBeNull();
  });

  test('renders NLUDisplay with correct details when nluDetails is provided', () => {
    render(<VoiceRecognitionCard {...mockProps} nluDetails={mockNluDetails} />);
    expect(screen.getByText('Voice Command Details:')).toBeTruthy();
    expect(screen.getByText(/Intent:/)).toHaveTextContent(`Intent: ${mockNluDetails.intent}`);
    expect(screen.getByText(/- screen: Home/)).toBeTruthy();
  });
});
