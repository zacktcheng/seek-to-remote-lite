package seektoremotelite;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;

import entity.Item;
import helper.Helper;
import recommendation.Recommendation;

/**
 * Servlet implementation class RecommendItem
 */
public class RecommendItem extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public RecommendItem() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		// Assure the session's already logged-in before any recommending.
		HttpSession session = request.getSession(false);

		if (session == null) {
			response.setStatus(403);
			return;
		}

		// Recommend currently available job posts.
		String userId = request.getParameter("user_id");
		String category = request.getParameter("category");

		Recommendation recommendation = new Recommendation();
		List<Item> items = recommendation.recommendItems(userId, category);
		JSONArray array = new JSONArray();

		for (Item item : items) {
			array.put(item.toJSONObject());
		}

		Helper.writeJsonArray(response, array);
	}
}
