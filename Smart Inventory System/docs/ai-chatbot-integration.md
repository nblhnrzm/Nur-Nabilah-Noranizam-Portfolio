# SmartStock AI Chatbot Integration

This document describes the AI chatbot implementation for the SmartStock inventory management system using LangGraph with Node.js and Qwen API integration.

## Overview

The SmartStock AI Chatbot provides intelligent assistance for inventory management tasks, including:

- **Stock Operations**: Guidance on stock-in/out procedures
- **Product Management**: Help with adding, editing, and organizing products
- **Warehouse Management**: Assistance with warehouse and zone setup
- **System Usage**: Tips and best practices for using SmartStock features
- **Real-time Support**: Instant answers to inventory-related questions

## Architecture

### Backend Components

1. **Node.js Server** (`backend/chatbot-server.js`)
   - Express.js REST API server
   - Socket.IO for real-time WebSocket communication
   - LangGraph workflow for conversation management
   - Qwen API integration for AI responses

2. **LangGraph Workflow**
   - Context checking and enhancement
   - Message processing with AI model
   - Fallback responses when API is unavailable
   - Session state management

3. **Qwen API Client**
   - Alibaba Cloud's Qwen large language model
   - Fallback responses for offline scenarios
   - Inventory-specific response patterns

### Frontend Components

1. **Chat Interface** (`components/chat-interface.tsx`)
   - Modern chat UI with real-time messaging
   - Typing indicators and connection status
   - Minimize/maximize functionality
   - Responsive design for mobile and desktop

2. **Floating Action Button Integration**
   - AI Assistant button in the floating menu
   - Seamless integration with existing stock operations
   - Easy access from any page in the application

## Setup Instructions

### 1. Environment Configuration

Add the following variables to your `.env.local` file:

```bash
# Qwen AI Configuration
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_BASE=https://dashscope.aliyuncs.com/api/v1
CHATBOT_PORT=3001
```

### 2. Install Dependencies

The following packages are required and already installed:

```bash
# Backend dependencies
- express: Web server framework
- socket.io: Real-time communication
- cors: Cross-origin resource sharing
- axios: HTTP client for API calls
- @langchain/core: LangChain core utilities
- @langchain/community: LangChain community integrations
- @langchain/langgraph: State graph workflow management

# Frontend dependencies
- socket.io-client: WebSocket client
- lucide-react: Icons for the UI
```

### 3. Start the Services

#### Option 1: Run services separately
```bash
# Terminal 1: Start the Next.js development server
npm run dev

# Terminal 2: Start the chatbot server
npm run chatbot
```

#### Option 2: Run both services together
```bash
# Start both Next.js and chatbot server concurrently
npm run dev:all
```

## Features

### Intelligent Responses

The AI assistant provides contextual help based on user queries:

- **Stock Operations**: Step-by-step guidance for inventory transactions
- **Product Management**: Instructions for adding and editing products
- **Barcode Scanning**: Help with scanning and recognition features
- **Warehouse Setup**: Guidance on organizing warehouses and zones
- **General Support**: System navigation and best practices

### Fallback System

When the Qwen API is unavailable, the system provides intelligent fallback responses based on keyword matching and predefined patterns, ensuring users always receive helpful guidance.

### Real-time Communication

- WebSocket-based real-time messaging
- Typing indicators for better user experience
- Connection status monitoring
- Session persistence across page refreshes

### Mobile-Friendly Design

- Responsive chat interface
- Touch-optimized controls
- Minimize/maximize functionality
- Seamless integration with existing mobile UI

## API Endpoints

### WebSocket Events

#### Client to Server:
- `initChat`: Initialize a new chat session
- `chatMessage`: Send a user message
- `getChatHistory`: Request chat history

#### Server to Client:
- `chatInitialized`: Confirm session initialization
- `chatResponse`: AI response to user message
- `botTyping`: Typing indicator status
- `chatError`: Error message

### REST API

#### Health Check
```
GET /health
```
Returns server status and active session count.

#### Direct Chat API
```
POST /api/chat
Content-Type: application/json

{
  "message": "How do I perform a stock-in operation?"
}
```

## Usage Examples

### Basic Conversation Flow

1. User clicks "AI Assistant" from the floating action menu
2. Chat interface opens with welcome message
3. User types: "How do I add new products?"
4. AI responds with step-by-step instructions
5. User can continue asking follow-up questions

### Integration with Stock Operations

The AI assistant can guide users through specific inventory tasks:

```
User: "I need to receive new inventory"
AI: "To perform a stock-in operation:
1. Click the green 'Stock In' button in the floating action menu
2. Select the product and destination zone
3. Enter the quantity received
4. Add reference information (PO number, invoice, etc.)
5. Submit the transaction

This will update your inventory levels automatically."
```

## Customization

### Adding New Response Patterns

To add new fallback responses, edit the `getFallbackResponse()` method in `backend/chatbot-server.js`:

```javascript
getFallbackResponse(messages) {
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage?.content?.toLowerCase() || '';
  
  if (content.includes('your_keyword')) {
    return "Your custom response here";
  }
  // ... existing patterns
}
```

### Modifying the Context

Update the `INVENTORY_CONTEXT` variable to customize the AI's knowledge about your specific inventory system:

```javascript
const INVENTORY_CONTEXT = `
Your custom system description and capabilities...
`;
```

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Ensure both servers are running (ports 3000 and 3001)
   - Check firewall settings
   - Verify CORS configuration

2. **Qwen API Issues**
   - Verify API key in environment variables
   - Check API endpoint accessibility
   - Monitor API rate limits

3. **Chat Interface Not Loading**
   - Check browser console for errors
   - Ensure Socket.IO client is properly connected
   - Verify component imports

### Debugging

Enable verbose logging by setting `NODE_ENV=development` and checking:
- Browser developer tools console
- Server terminal output
- Network tab for WebSocket connections

## Security Considerations

- API keys are stored securely in environment variables
- CORS is configured to restrict access to localhost during development
- User messages are not logged permanently
- Sessions expire after 5 minutes of inactivity

## Performance

- Chat sessions are stored in memory for fast access
- WebSocket connections minimize latency
- Fallback responses ensure system availability
- Messages are processed asynchronously

## Future Enhancements

Potential improvements for the AI chatbot:

1. **Database Integration**: Access real inventory data for specific queries
2. **Voice Input**: Speech-to-text for hands-free operation
3. **Multi-language Support**: Responses in multiple languages
4. **Advanced Analytics**: Chat interaction analytics and insights
5. **Proactive Notifications**: AI-initiated alerts and suggestions
6. **Integration with External APIs**: Connect to suppliers, shipping providers
7. **Workflow Automation**: AI-assisted inventory task automation

## Support

For issues or questions about the AI chatbot implementation:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test the `/health` endpoint for server status
4. Verify environment configuration

The AI chatbot enhances the SmartStock experience by providing instant, intelligent assistance for all inventory management tasks.