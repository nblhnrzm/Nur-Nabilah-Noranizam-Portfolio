const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const { StateGraph, END } = require('@langchain/langgraph');
const { BaseMessage, HumanMessage, AIMessage } = require('@langchain/core/messages');
const { Annotation } = require('@langchain/langgraph');
const axios = require('axios');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: "http://localhost:3000", // Your Next.js app URL
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: corsOptions
});

// Qwen API Configuration
const QWEN_API_BASE = process.env.QWEN_API_BASE || 'https://dashscope.aliyuncs.com/api/v1';
const QWEN_API_KEY = process.env.QWEN_API_KEY || 'your-qwen-api-key-here';

// Inventory context for the AI assistant
const INVENTORY_CONTEXT = `
You are an AI assistant for SmartStock, an intelligent inventory management system. 
You help users with:

1. **Stock Operations**: Stock-in, stock-out, inventory adjustments
2. **Product Management**: Adding, editing, searching products
3. **Warehouse Management**: Managing warehouses, zones, and locations
4. **Inventory Analysis**: Stock levels, low stock alerts, reports
5. **System Usage**: How to use features, best practices
6. **Data Insights**: Inventory trends, optimization suggestions

Key features of the system:
- Multi-warehouse support with zone management
- Barcode scanning and item recognition
- Real-time stock tracking
- Transaction history and audit trails
- Local PWA with offline capabilities
- Multi-language support

Always provide helpful, accurate responses about inventory management. 
If asked about specific products or stock levels, explain that you'd need to check the current database.
Suggest practical actions users can take within the SmartStock system.
Keep responses concise but informative.
`;

// Define the state schema using Annotation
const StateAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  context: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => INVENTORY_CONTEXT,
  }),
  sessionId: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
});

// Qwen API Client
class QwenClient {
  constructor(apiKey, baseUrl = QWEN_API_BASE) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async chat(messages, model = 'qwen-turbo') {
    try {
      const response = await axios.post(
        `${this.baseUrl}/services/aigc/text-generation/generation`,
        {
          model: model,
          input: {
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          },
          parameters: {
            max_tokens: 1500,
            temperature: 0.7,
            top_p: 0.8,
            repetition_penalty: 1.1
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-SSE': 'disable'
          }
        }
      );

      if (response.data.output && response.data.output.text) {
        return response.data.output.text;
      } else {
        throw new Error('Invalid response from Qwen API');
      }
    } catch (error) {
      console.error('Qwen API Error:', error.response?.data || error.message);
      
      // Fallback response when Qwen API is not available
      return this.getFallbackResponse(messages);
    }
  }

  getFallbackResponse(messages) {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content?.toLowerCase() || '';
    
    if (content.includes('stock in') || content.includes('receive') || content.includes('incoming')) {
      return "To perform a stock-in operation:\n1. Click the green 'Stock In' button in the floating action menu\n2. Select the product and destination zone\n3. Enter the quantity received\n4. Add reference information (PO number, invoice, etc.)\n5. Submit the transaction\n\nThis will update your inventory levels automatically.";
    } else if (content.includes('stock out') || content.includes('ship') || content.includes('dispatch')) {
      return "To perform a stock-out operation:\n1. Click the amber 'Stock Out' button in the floating action menu\n2. Select the product and source zone\n3. Enter the quantity to remove\n4. Add reference information (order number, etc.)\n5. Submit the transaction\n\nMake sure you have sufficient stock before proceeding.";
    } else if (content.includes('barcode') || content.includes('scan')) {
      return "SmartStock supports barcode scanning for quick product identification:\n1. Click the blue 'Scan Barcode' button\n2. Use your camera to scan the product barcode\n3. The system will identify the product automatically\n4. You can then perform stock operations directly\n\nYou can also manually enter barcodes if needed.";
    } else if (content.includes('product') || content.includes('add') || content.includes('create')) {
      return "To manage products in SmartStock:\n1. Go to the Inventory page\n2. Click 'Add Product' to create new items\n3. Fill in product details (name, SKU, category, etc.)\n4. Set up initial stock levels and locations\n5. Save to add to your inventory\n\nYou can also edit existing products by clicking on them in the inventory list.";
    } else if (content.includes('warehouse') || content.includes('zone') || content.includes('location')) {
      return "SmartStock supports multi-warehouse management:\n1. Go to the Warehouse page to manage locations\n2. Create warehouses and organize them into zones\n3. Assign products to specific zones for better organization\n4. Track stock levels by location\n\nThis helps you maintain organized inventory across multiple facilities.";
    } else {
      return "Hello! I'm your SmartStock AI assistant. I can help you with:\n\n• Stock operations (in/out transactions)\n• Product management and setup\n• Warehouse and zone organization\n• Barcode scanning features\n• Inventory analysis and reports\n\nWhat would you like to know about managing your inventory?";
    }
  }
}

// Initialize Qwen client
const qwenClient = new QwenClient(QWEN_API_KEY);

// LangGraph Node Functions
async function processUserMessage(state) {
  console.log('Processing user message:', state.messages[state.messages.length - 1]?.content);
  
  // Prepare messages for Qwen API
  const apiMessages = [
    { role: 'system', content: state.context },
    ...state.messages.map(msg => ({
      role: msg instanceof HumanMessage ? 'user' : 'assistant',
      content: msg.content
    }))
  ];

  try {
    const response = await qwenClient.chat(apiMessages);
    
    // Add AI response to state
    return {
      ...state,
      messages: [...state.messages, new AIMessage(response)]
    };
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      ...state,
      messages: [...state.messages, new AIMessage(
        "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact support if the issue persists."
      )]
    };
  }
}

async function checkContext(state) {
  // Check if we need to provide inventory-specific context
  const lastMessage = state.messages[state.messages.length - 1]; // User message
  if (lastMessage && lastMessage instanceof HumanMessage) {
    const content = lastMessage.content.toLowerCase();
    
    let updatedContext = state.context;
    
    // Add specific context based on user query
    if (content.includes('stock') || content.includes('inventory')) {
      updatedContext += '\n\nCurrent context: User is asking about stock/inventory operations.';
    } else if (content.includes('product') || content.includes('item')) {
      updatedContext += '\n\nCurrent context: User is asking about product management.';
    } else if (content.includes('warehouse') || content.includes('zone')) {
      updatedContext += '\n\nCurrent context: User is asking about warehouse/zone management.';
    } else if (content.includes('barcode') || content.includes('scan')) {
      updatedContext += '\n\nCurrent context: User is asking about barcode scanning features.';
    }
    
    return {
      ...state,
      context: updatedContext
    };
  }
  
  return state;
}

// Create LangGraph workflow
const workflow = new StateGraph(StateAnnotation)
  .addNode('checkContext', checkContext)
  .addNode('processMessage', processUserMessage)
  .addEdge('checkContext', 'processMessage')
  .addEdge('processMessage', END)
  .setEntryPoint('checkContext');

const app_graph = workflow.compile();

// Store active chat sessions
const chatSessions = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Initialize chat session
  socket.on('initChat', (data) => {
    const sessionId = data.sessionId || socket.id;
    const chatState = {
      messages: [new AIMessage(
        "Hello! I'm your SmartStock AI assistant. I can help you with inventory management, stock operations, product queries, and system guidance. How can I assist you today?"
      )],
      context: INVENTORY_CONTEXT,
      sessionId: sessionId
    };
    
    chatSessions.set(sessionId, chatState);
    
    socket.emit('chatInitialized', {
      sessionId: sessionId,
      message: chatState.messages[chatState.messages.length - 1].content
    });
  });

  // Handle chat messages
  socket.on('chatMessage', async (data) => {
    try {
      const { sessionId, message, userId } = data;
      const chatState = chatSessions.get(sessionId) || {
        messages: [],
        context: INVENTORY_CONTEXT,
        sessionId: sessionId
      };
      
      // Add user message to state
      const updatedState = {
        ...chatState,
        messages: [...chatState.messages, new HumanMessage(message)]
      };
      
      // Emit typing indicator
      socket.emit('botTyping', { typing: true });
      
      // Process message through LangGraph
      const result = await app_graph.invoke(updatedState);
      
      // Update session
      chatSessions.set(sessionId, result);
      
      // Send response
      const aiResponse = result.messages[result.messages.length - 1];
      socket.emit('botTyping', { typing: false });
      socket.emit('chatResponse', {
        message: aiResponse.content,
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}`
      });
      
    } catch (error) {
      console.error('Chat error:', error);
      socket.emit('botTyping', { typing: false });
      socket.emit('chatError', {
        error: 'Sorry, I encountered an error processing your message. Please try again.'
      });
    }
  });

  // Handle chat history request
  socket.on('getChatHistory', (data) => {
    const { sessionId } = data;
    const chatState = chatSessions.get(sessionId);
    
    if (chatState) {
      const history = chatState.messages.map((msg, index) => ({
        id: `msg_${index}`,
        content: msg.content,
        role: msg instanceof HumanMessage ? 'user' : 'assistant',
        timestamp: new Date().toISOString()
      }));
      
      socket.emit('chatHistory', { history });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Optionally clean up session after some time
    setTimeout(() => {
      chatSessions.delete(socket.id);
    }, 300000); // 5 minutes
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeSessions: chatSessions.size
  });
});

// API endpoint for testing
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const chatState = {
      messages: [new HumanMessage(message)],
      context: INVENTORY_CONTEXT,
      sessionId: 'api_test'
    };
    
    const result = await app_graph.invoke(chatState);
    const aiResponse = result.messages[result.messages.length - 1];
    
    res.json({
      response: aiResponse.content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.CHATBOT_PORT || 3001;

server.listen(PORT, () => {
  console.log(`🤖 SmartStock AI Chatbot Server running on port ${PORT}`);
  console.log(`🌐 Socket.IO endpoint: http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});