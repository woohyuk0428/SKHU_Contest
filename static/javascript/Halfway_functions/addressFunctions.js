export default class InputAddressFunctions {
    // input을 넣을 컨테이너 위치 저장
    constructor(inputContainer) {
        this.inputContainer = inputContainer;
    }

    // input을 생성하는 함수
    addInput() {
        const addressInputTemplate = `<div class="input-group mt-2">
            <input type="text" class="form-control address-input" name="address" placeholder="출발지점을 입력하세요.">
            <div class="input-group-append">
                <button class="btn btn-danger remove-address" type="button">삭제</button>
            </div>
        </div>`;

        this.inputContainer.insertAdjacentHTML("beforeend", addressInputTemplate);
        this.activateRemoveButtons();
        this.activateAutoAddress();
    }

    // 삭제 버튼을 생성하고 기능을 추가하는 함수
    activateRemoveButtons() {
        const removeButtons = this.inputContainer.querySelectorAll(".remove-address");

        removeButtons.forEach(function (button) {
            button.addEventListener("click", this.removeAddress.bind(this));
        }, this);
    }

    // 삭제 버튼을 눌렀을 때 input-group 한개를 삭제하는 함수
    removeAddress() {
        const parentInputGroup = this.closest(".input-group");
        parentInputGroup.remove();
    }

    // input을 생성할 때 주소 자동완성 기능을 추가하는 함수
    activateAutoAddress() {
        const addressInputs = this.inputContainer.querySelectorAll('input[name="address"]');
        new google.maps.places.Autocomplete(addressInputs[addressInputs.length - 1]);
    }
}
