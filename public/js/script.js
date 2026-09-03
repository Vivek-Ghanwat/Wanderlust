document.addEventListener('DOMContentLoaded', () => {
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');
  // Loop over them and prevent submission if invalid
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      console.log('Form submit attempted');
      if (!form.checkValidity()) {
        console.log('Form invalid');
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
});