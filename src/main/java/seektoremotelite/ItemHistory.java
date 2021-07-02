package seektoremotelite;

import java.io.IOException;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import database.MySQLConnection;
import entity.Item;
import helper.Helper;

/**
 * Servlet implementation class ItemHistory
 */
public class ItemHistory extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public ItemHistory() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		// Assure the session's already logged-in before any retrieving.
		HttpSession session = request.getSession(false);

		if (session == null) {
			response.setStatus(403);
			return;
		}

		// Retrieve user-saved job posts.
		String userId = request.getParameter("user_id");

		MySQLConnection connection = new MySQLConnection();
		Set<Item> items = connection.getFavoriteItems(userId);
		connection.close();

		JSONArray array = new JSONArray();

		for (Item item : items) {
			JSONObject obj = item.toJSONObject();
			obj.put("favorite", true);
			array.put(obj);
		}
		Helper.writeJsonArray(response, array);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		// Assure the session's already logged-in before any instantiation.
		HttpSession session = request.getSession(false);

		if (session == null) {
			response.setStatus(403);
			return;
		}

		// Instantiate the user-saved job post.
		MySQLConnection connection = new MySQLConnection();

		try {
			JSONObject input = Helper.readJSONObject(request);
			String userId = input.getString("user_id");
			Item item = Helper.parseFavoriteItem(input.getJSONObject("favorite"));

			connection.setFavoriteItems(userId, item);
			connection.close();
			Helper.writeJsonObject(response, new JSONObject().put("result", "SUCCESS"));
		} catch (JSONException e) {
			e.printStackTrace();
		} finally {
			connection.close();
		}
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */
	protected void doDelete(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		// Assure the session's already logged-in before any deletion.
		HttpSession session = request.getSession(false);

		if (session == null) {
			response.setStatus(403);
			return;
		}

		// Delete the user-saved job post.
		MySQLConnection connection = new MySQLConnection();

		try {
			JSONObject input = Helper.readJSONObject(request);
			String userId = input.getString("user_id");
			Item item = Helper.parseFavoriteItem(input.getJSONObject("favorite"));

			connection.unsetFavoriteItems(userId, item.getItemId());
			connection.close();
			Helper.writeJsonObject(response, new JSONObject().put("result", "SUCCESS"));
		} catch (JSONException e) {
			e.printStackTrace();
		} finally {
			connection.close();
		}
	}
}
