package seektoremotelite;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import database.MySQLConnection;
import helper.Helper;

/**
 * Servlet implementation class Register
 */
public class Register extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public Register() {
        super();
        // TODO Auto-generated constructor stub
    }

    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
     *      response)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        JSONObject input = Helper.readJSONObject(request);
        String userId = input.getString("user_id");
        String password = input.getString("password");
        String firstName = input.getString("first_name");
        String lastName = input.getString("last_name");

        MySQLConnection connection = new MySQLConnection();
        JSONObject object = new JSONObject();
        boolean canAddUser = connection.addUser(userId, password, firstName, lastName);

        if (canAddUser) {
            object.put("status", "OK");
        } else {
            object.put("status", "User Already Exists");
        }
        connection.close();
        Helper.writeJsonObject(response, object);
    }
}