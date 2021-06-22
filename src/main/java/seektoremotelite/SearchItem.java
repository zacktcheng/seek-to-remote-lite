package seektoremotelite;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONObject;

import database.MySQLConnection;
import entity.Item;
import external.RemotiveClient;
import helper.Helper;

/**
 * Servlet implementation class SearchItem
 */
public class SearchItem extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SearchItem() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// Assure the session's already logged-in before any searching. 
		HttpSession session = request.getSession(false);
		
		if(session == null) {
			response.setStatus(403);
			return;
		}
		
		// Search to obtain job posts.
		String userId = request.getParameter("user_id");
		String category = request.getParameter("category");
		
		RemotiveClient remotiveClient = new RemotiveClient();
		List<Item> items = remotiveClient.search(category);
		
		MySQLConnection connection = new MySQLConnection();
		Set<String> favoritedItemIds = connection.getFavoriteItemIds(userId);
		connection.close();
		
		JSONArray array = new JSONArray();

		for(Item item : items) { 
			JSONObject object = item.toJSONObject();
			// Put "favorite" to let the front-end code to turn on the indicator which tells the user that the item has been saved.
			object.put("favorite", favoritedItemIds.contains(item.getItemId()));
			array.put(object); 
		}	
		Helper.writeJsonArray(response, array);
	}
}

