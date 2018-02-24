$(document).ready(function () {
  $('.datepicker').datepicker();

  var roomBox;
  $('.actions .minus').click(function () {
    roomBox = $(this).closest('.search-item').find('.room-number');
    var changedVal = parseInt(roomBox.val());
    if (changedVal > 0) roomBox.val(roomBox.val() - 1);
  })

  $('.actions .plus').click(function () {
    roomBox = $(this).closest('.search-item').find('.room-number');
    roomBox.val(parseInt(roomBox.val()) + 1);
  })
})