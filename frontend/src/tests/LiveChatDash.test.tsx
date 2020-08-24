import React from 'react';
import { render } from '@testing-library/react';
import LiveChatDash from '../LiveChatDash';

test('renders learn react link', () => {
	const { getByText } = render(<LiveChatDash endpoint="https://localhost:5000" path="/livechat" />);
	const linkElement = getByText(/learn react/i);
	expect(linkElement).toBeInTheDocument();
});
