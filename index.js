const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const pool = require("./connection");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");

// List Employees with pagination
app.get("/", (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  // Fetch employees from the database with pagination
  pool.query(
    "SELECT * FROM employees LIMIT ?, ?",
    [offset, limit],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.render("index", { employees: results });
    }
  );
});
app.get("/newEmployee", (req, res) => {
  res.render("add_employee");
});

// Create Employee
app.post("/employees", (req, res) => {
  // Extract employee details from the request body
  const { name, contactType, contactValue } = req.body;
  // Insert the employee into the database
  const contactDetails = [];
  for (let i = 0; i < contactType.length; i++) {
    contactDetails.push({
      type: contactType[i],
      value: contactValue[i],
    });
  }
  pool.query(
    "INSERT INTO employees (name) VALUES (?)",
    [name],
    (error, results) => {
      if (error) {
        throw error;
      }

      const employeeId = results.insertId;

      // Insert the employee's contact details into the database
      const contactValues = contactDetails.map((contact) => [
        employeeId,
        contact.type,
        contact.value,
      ]);

      pool.query(
        "INSERT INTO contact_details (employee_id, type, value) VALUES ?",
        [contactValues],
        (error, results) => {
          if (error) {
            throw error;
          }

          res.status(201).redirect("/");
        }
      );
    }
  );
});

// Update Employee
app.post("/updateEmployees/:id", (req, res) => {
  const employeeId = req.params.id;
  const { name, contactType, contactValue } = req.body;
  // Insert the employee into the database
  const contactDetails = [];
  for (let i = 0; i < contactType.length; i++) {
    contactDetails.push({
      type: contactType[i],
      value: contactValue[i],
    });
  }
  pool.query(
    "UPDATE employees SET name = ? WHERE id = ?",
    [name, employeeId],
    (error, results) => {
      if (error) {
        throw error;
      }

      // Delete the existing contact details for the employee
      pool.query(
        "DELETE FROM contact_details WHERE employee_id = ?",
        [employeeId],
        (error, results) => {
          if (error) {
            throw error;
          }

          // Insert the updated contact details into the database
          const contactValues = contactDetails.map((contact) => [
            employeeId,
            contact.type,
            contact.value,
          ]);

          pool.query(
            "INSERT INTO contact_details (employee_id, type, value) VALUES ?",
            [contactValues],
            (error, results) => {
              if (error) {
                throw error;
              }

              res.redirect("/");
            }
          );
        }
      );
    }
  );
});

// Delete Employee
app.get("/delete/:id", (req, res) => {
  const employeeId = req.params.id;

  // Delete the employee from the database
  pool.query(
    "DELETE FROM employees WHERE id = ?",
    [employeeId],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.redirect("/");
    }
  );
});

// Get Employee
app.get("/employees/:id", (req, res) => {
  const employeeId = req.params.id;

  // Fetch the employee from the database
  pool.query(
    "SELECT * FROM employees WHERE id = ?",
    [employeeId],
    (error, results) => {
      if (error) {
        throw error;
      }

      const employee = results[0];

      // Fetch the employee's contact details from the database
      pool.query(
        "SELECT * FROM contact_details WHERE employee_id = ?",
        [employeeId],
        (error, results) => {
          if (error) {
            throw error;
          }

          const contactDetails = results;

          res.render("show", { employee, contactDetails });
        }
      );
    }
  );
});
app.get("/update/:id", (req, res) => {
  const employeeId = req.params.id;

  // Fetch the employee from the database
  pool.query(
    "SELECT * FROM employees WHERE id = ?",
    [employeeId],
    (error, results) => {
      if (error) {
        throw error;
      }

      const employee = results[0];

      // Fetch the employee's contact details from the database
      pool.query(
        "SELECT * FROM contact_details WHERE employee_id = ?",
        [employeeId],
        (error, results) => {
          if (error) {
            throw error;
          }

          const contactDetails = results;

          res.render("update", { employee, contactDetails });
        }
      );
    }
  );
});

app.listen(5001, () => {
  console.log("Server is running on port 5001");
});
