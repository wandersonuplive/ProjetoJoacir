var Dialog = {};


Dialog._appendContainer = function (content, actions, title, onShowCallback) {
    var $container = $('<div>').addClass('dialog-container').attr('tabindex', 1);
    var $dialog = $('<div>').addClass('dialog');

    if (content instanceof jQuery && content.hasClass('dialog-model')) {
        content.removeClass('dialog-model');
    }
    
    var $content = $('<div>').addClass('dialog-content').html(content);
    var $actions = $('<div>').addClass('dialog-actions');
    $actions.append(actions);

    if (!StringUtils.isNullOrWhiteSpace(title)) {
        var $title = $('<div>').addClass('dialog-title').html(title);
        $dialog.append($title);
    }

    $dialog.append($content);
    $dialog.append($actions);
    $container.append($dialog);

    $container.hide();
    $(document.body).append($container);
    setTimeout(function () {
        $container.fadeIn(200);
        $container.addClass('active');
        $container.focus();
        if (onShowCallback) onShowCallback();
    }, 10);

    return $container;
};

Dialog._removeContainer = function ($container, onRemoveCallback) {
    $container.removeClass('active');
    $container.fadeOut(200, function () {
        $container.remove();
        if (onRemoveCallback) onRemoveCallback();
    });
};

Dialog._getBtnAction = function (text, cssClasses, dialogInfo, onClickFuncName) {
    var $btn = $('<button>').text(text).addClass(cssClasses).on('click', function () {
        var func = dialogInfo[onClickFuncName];
        if (func != null) func.apply(null, dialogInfo[onClickFuncName + 'Args']);
        Dialog._removeContainer(dialogInfo.$container);
    });
    return $btn;
};

Dialog.show = function (content, title) {
    var dialogInfo = {};

    var btnOk = Dialog._getBtnAction('OK', 'dialog-btn-positive btn', dialogInfo, '_ok');

    dialogInfo.$container = Dialog._appendContainer(content, btnOk, title);
    dialogInfo.$container.on('keypress', function (e) {
        if (e.which == 13) {
            Dialog._removeContainer(dialogInfo.$container, dialogInfo._ok);
        }
    });

    dialogInfo.ok = function (f, args) {
        dialogInfo._ok = f;
        dialogInfo._okArgs = args;
        return dialogInfo;
    }

    return dialogInfo;
};

Dialog.confirm = function (content, positiveBtnText, neutralBtnText, negativeBtnText, title) {
    var dialogInfo = {};
    var btnActions = [];

    if (neutralBtnText != null)
        btnActions.push(Dialog._getBtnAction(neutralBtnText, 'btn btn-default', dialogInfo, '_onNeutralBtnClick'));
    if (negativeBtnText != null)
        btnActions.push(Dialog._getBtnAction(negativeBtnText, 'btn btn-danger', dialogInfo, '_onNegativeBtnClick'));
    if (positiveBtnText != null)
        btnActions.push(Dialog._getBtnAction(positiveBtnText, 'btn btn-success', dialogInfo, '_onPositiveBtnClick'));

    dialogInfo.$container = Dialog._appendContainer(content, btnActions, title,
        /* onShow */ function () {
            if (dialogInfo._onShow != null)
                dialogInfo._onShow();
    });
    dialogInfo.$container.on('keypress', function (e)
    {
        if (e.which == 13 /* enter */)
        {
            Dialog._removeContainer(dialogInfo.$container, dialogInfo._onPositiveBtnClick);
        }
    });

    dialogInfo.onPositiveBtnClick = function (f) {
        dialogInfo._onPositiveBtnClick = f;
        return dialogInfo;
    };
    dialogInfo.onNegativeBtnClick = function (f) {
        dialogInfo._onNegativeBtnClick = f;
        return dialogInfo;
    };
    dialogInfo.onNeutralBtnClick = function (f) {
        dialogInfo._onNeutralBtnClick = f;
        return dialogInfo;
    };
    dialogInfo.onShow = function(f) {
        dialogInfo._onShow = f;
        return dialogInfo;
    }
    return dialogInfo;
};

