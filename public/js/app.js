$(document).ready(function () {
  function showMessage(msg, success = true) {
    $("#statusMessage").html(
      `<div class="alert alert-${success ? "success" : "danger"}">${msg}</div>`,
    );
  }

  function getUniqIdValue(prefix = "id") {
    return prefix + "_" + Math.random().toString(36).substr(2, 9);
  }

  function formatDate(dateString) {
    return (dateString) ? new Date(dateString).toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) : '';
  }

  async function loadUsers() {
    const users = await $.get("/users");
    const tbody = $("#userTable");
    tbody.empty();
    users.forEach((user) => {
      tbody.append(`
                <tr>
                    <td><input type="checkbox" class="userCheckbox" data-id="${user.id}"></td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${formatDate(user.last_login)}</td>
                    <td>${user.status}</td>
                </tr>
            `);
    });
  }

  $("#selectAll").on("change", function () {
    $(".userCheckbox").prop("checked", $(this).prop("checked"));
  });

  async function performAction(url) {
    const ids = $(".userCheckbox:checked")
      .map((i, el) => $(el).data("id"))
      .get();
    if (!ids.length && url !== "/users/delete-unverified")
      return showMessage("Выберите пользователей", false);
    const resp = await $.post(url, { ids });
    if (resp.success) {
      showMessage("Операция выполнена успешно");
      loadUsers();
    } else showMessage("Ошибка", false);
  }

  $("#blockBtn").click(() => performAction("/users/block"));
  $("#unblockBtn").click(() => performAction("/users/unblock"));
  $("#deleteBtn").click(() => performAction("/users/delete"));
  $("#verifyBtn").click(() => performAction("/users/verify"));
  $("#deleteUnverifiedBtn").click(() =>
    performAction("/users/delete-unverified"),
  );

  loadUsers();
});
