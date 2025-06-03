export default function Home() {
  return (
    <div className="container">
      <h1>Intranet Coacharte API</h1>
      <p>✅ API Status: Running</p>
      <div>
        <h2>Available API Endpoints:</h2>
        <ul>
          <li>
            <strong>GET</strong> <a href="/api/health">/api/health</a> - Health check
          </li>
          <li>
            <strong>POST</strong> /api/users/login - User authentication
          </li>
        </ul>
      </div>
      <div>
        <h2>Client Application:</h2>
        <p>The React client application is located in the <code>/client</code> directory and should be deployed separately.</p>
      </div>
    </div>
  );
}