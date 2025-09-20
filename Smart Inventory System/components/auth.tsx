// Auth component is disabled for demo purposes
export const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold mb-6">Demo Mode</h2>
        <p className="text-center text-gray-600">
          Authentication is disabled for this demo. The app will load automatically.
        </p>
      </div>
    </div>
  );
};