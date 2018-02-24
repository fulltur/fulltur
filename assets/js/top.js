function showErrorBox(msg){
    toastr.error(msg)
}
 
function showSuccessBox(msg) {
    toastr.success(msg)
}

function showInfoBox(msg) {
    toastr.info(msg)
}

function printDiv(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}

function ReservationError(msg) {
    toastr.error(msg)
}