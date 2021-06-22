package seektoremotelite;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONObject;

import database.MySQLConnection;
import helper.Helper;

/**
 * Servlet implementation class Login
 */
public class Login extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Login() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		HttpSession session = request.getSession(false);
		JSONObject object = new JSONObject();
		
		if(session != null) {
			MySQLConnection connection = new MySQLConnection();
			String userId = session.getAttribute("user_id").toString();
			object.put("status", "OK").put("user_id", userId).put("user_name", connection.getUsername(userId));
			connection.close();
		} 
		else {
			object.put("status", "Invalid Session");
			response.setStatus(403);
		}
		Helper.writeJsonObject(response, object);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		JSONObject input = Helper.readJSONObject(request);
		String userId = input.getString("user_id");
		String password = input.getString("password");

		MySQLConnection connection = new MySQLConnection();
		JSONObject object = new JSONObject();
		boolean canPassVerification = connection.verifyLogin(userId, password);
		
		if(canPassVerification) {
			HttpSession session = request.getSession();
			session.setAttribute("user_id", userId);
			session.setMaxInactiveInterval(600);
			object.put("status", "OK").put("user_id", userId).put("user_name", connection.getUsername(userId));
		} 
		else {
			object.put("status", "User Doesn't Exist");
			response.setStatus(401);
		}
		connection.close();
		Helper.writeJsonObject(response, object);
	}
}
