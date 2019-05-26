var Utils = {};

Utils.htmlEncode = function (value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
};

Utils.htmlDecode = function (value) {
    return $('<div/>').html(value).text();
};

Utils.zeroPad = function (x, y) {
    y = Math.max(y - 1, 0);
    var n = (x / Math.pow(10, y)).toFixed(y);
    return n.replace('.', '');
};

// Abre uma nova página mostrando o erro retornado pela requisição.
Utils.printError = function (ex) {

    if (ex != null && ex.responseText != null) {

        console.error('Objeto de erro da requisição', ex);

        // se há um redirecionamento de timeout em andamento
        // então não mostra mais nenhuma mensagem ao usuário
        if (Utils._redirectCountDown) return;

        // Não autorizado. Provavelmente o usuário estava logado
        // mas sua sessão expirou. Avisa o usuário e redireciona 
        // para a página de login.
        if (ex.status == 403) {
            Utils._redirectCountDown = true;
            var intervalId = null;
            var tempoRedirect = 5;
            var $container = Dialog.confirm(
                $('<div class="flex horizontal">')
                    .append($('<div class="small-text">').append('Ops! Sua sessão parece ter expirado. Você será redirecionado para a página de login para informar suas credenciais novamente.'))
                    .append($('<div>').append('<i class="mi">mood_bad</i>')),
                `Redirecionando em ${tempoRedirect}...`, 'Cancelar', null,
                'Sessão expirada').onNeutralBtnClick(function () {
                    clearInterval(intervalId);
                    Utils._redirectCountDown = false;
                }).$container;
            $container.addClass('timeout-dialog');
            var $btnSuccess = $container.find('.btn-success').attr('disabled', true);

            intervalId = setInterval(function () {
                tempoRedirect--;
                if (tempoRedirect == 0) {
                    window.location.reload();
                    clearInterval(intervalId);
                } else {
                    $btnSuccess.text(`Redirecionando em ${tempoRedirect}...`);
                }
            }, 1000);

            return;
        }

        // Erro desconhecido, mostra o erro ao usuário.
        var resp = ex.responseText;
        var title = resp.substring(resp.indexOf('<title>') + 7, resp.indexOf('</title>'));

        Dialog.confirm('Uma requisição ao servidor retornou um erro. <b>Recomendamos que você recarregue a página e tente novamente.</b> ' +
            'Se o erro persistir mesmo após recarregar a página, entre em contato com o suporte técnico e informe o problema.<br><br>' +
            '<b>Detalhes avançados:</b><br>StatusText: <i>' + ex.statusText + '</i><div class="divider"></div>' +
            'ResponseText: <i class="error-text">' + title + '</i>',
            null, 'Mais detalhes do erro', 'Fechar', 'Erro na requisição')
            .onNeutralBtnClick(function () {
                window.open("", "_blank").document.write(ex.responseText);
            });
    } else {
        console.error('Erro na requisição. A propriedade "requestText" está nula. A requisição foi cancelada antes de ser completada ou o servidor está off-line?');
    }
};

Utils.toDateString = function (date) {
    var dia = Utils.zeroPad(date.getDate(), 2);
    var mes = Utils.zeroPad(date.getMonth() + 1, 2);
    var ano = date.getFullYear().toString();

    return dia + "/" + mes + "/" + ano;
};

Utils.toHourString = function (date) {
    return Utils.zeroPad(date.getHours(), 2) + ':' + Utils.zeroPad(date.getMinutes(), 2);
};

Utils.toUTCHourString = function (date) {
    return Utils.zeroPad(date.getUTCHours(), 2) + ':' + Utils.zeroPad(date.getUTCMinutes(), 2);
};

Utils.toDateHourString = function (date) {
    return Utils.toDateString(date) + ' ' + Utils.toHourString(date);
};

Utils.toFullHourString = function (date) {
    return Utils.zeroPad(date.getHours(), 2) + ':' + Utils.zeroPad(date.getMinutes(), 2) + ':' + Utils.zeroPad(date.getSeconds(), 2);
}

Utils.addDays = function (date, days) {
    var dataRetorno = new Date(date);
    dataRetorno.setDate(dataRetorno.getDate() + days);

    return dataRetorno;
};

Utils.setDropdownText = function ($dropdownBtn, text) {
    $dropdownBtn.contents().filter(function () {
        // Seleciona somente o texto do dropdown
        return this.nodeType == Node.TEXT_NODE;
    }).first()[0].textContent = text;
};

// Analisa a string do parâmetro e tenta converter para uma data.
// A data deve estar no formato dd/mm/yyyy.
// Se a data for inválida, null será retornado. 
Utils.parseSimpleDate = function (datestr) {
    var splitted = datestr.split('/');
    if (splitted.length != 3) {
        return null;
    }
    var d = new Date(splitted[2], Number(splitted[1]) - 1, splitted[0]);
    return isNaN(d.getTime()) ? null : d;
};

Utils.dateMonthShort = function (date) {
    return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][date.getMonth()];
};

Utils.dateMonth = function (month) {
    return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][month - 1];
}

Utils.dateDayTwo = function (date) {
    return Utils.zeroPad(date.getDate(), 2);
};

Utils.dateLiteral = function (date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    date = new Date(date.getTime());
    date.setHours(0, 0, 0, 0);

    if (today.getTime() == date.getTime()) {
        return "hoje";
    }
    if (new Date(today.getTime()).setDate(today.getDate() - 1) == date.getTime()) {
        return "ontem";
    }
    if (new Date(today.getTime()).setDate(today.getDate() + 1) == date.getTime()) {
        return "amanhã";
    }
    return Utils.dateDayTwo(date) + ' ' + Utils.dateMonthShort(date) + (today.getFullYear() != date.getFullYear() ? ' ' + date.getFullYear().toString().substring(2, 4) : '');
};

Utils.dateLiteralFull = function (date, utc) {
    var currYear = null;
    var day = null;
    var week = null;
    var month = null;
    var year = null;

    if (utc) {
        currYear = new Date().getUTCFullYear();
        day = date.getUTCDate();
        week = date.getUTCDay();
        month = date.getUTCMonth();
        year = date.getUTCFullYear();
    } else {
        currYear = new Date().getFullYear();
        day = date.getDate();
        week = date.getDay();
        month = date.getMonth();
        year = date.getFullYear();
    }

    return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][week] + ', ' +
        Utils.zeroPad(day.toString(), 2) + ' de ' + ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][month] +
        (currYear != year ? ' de ' + year : '');
};


Utils.parseDate = function (datestr) {
    var sprDtHra = datestr.split(' ');

    if (sprDtHra.length != 2)
        return null;

    var splitted = sprDtHra[0].split('/');
    var splittedHour = sprDtHra[1].split(':');

    if (splitted.length != 3 || splittedHour.length != 2)
        return null;

    //return splitted[2] + splitted[1] + splitted[0] + splittedHour[0] + splittedHour[1]; // Quem fez isso????
    var d = new Date(splitted[2], Number(splitted[1]) - 1, splitted[0], splittedHour[0], splittedHour[1]);

    return isNaN(d.getTime()) ? null : d;
};

// Retorna o Cookie do navegador pelo seu nome
Utils.getCookie = function (name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else
        begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1)
        end = dc.length;
    return unescape(dc.substring(begin + prefix.length, end));
};

// Retorna uma string contendo um <span> com um ícone do Bootstrap
Utils.getBootstrapIcon = function (name) {
    return '<span class="glyphicon glyphicon-' + name + '"></span>';
};

Utils.$getBootstrapIcon = function (name) {
    return $(Utils.getBootstrapIcon(name));
}

// Extrai o parâmetro da URL.
Utils.getUrlParam = function (name, url) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
};

Utils.removeUrlParam = function (name) {
    var url = document.location.href;
    var urlparts = url.split('?');

    console.log('removeUrlParam', url, urlparts);

    if (urlparts.length >= 2) {
        var urlBase = urlparts.shift();
        var queryString = urlparts.join("?");

        var prefix = encodeURIComponent(name) + '=';
        var pars = queryString.split(/[&;]/g);
        for (var i = pars.length; i-- > 0;)
            if (pars[i].lastIndexOf(prefix, 0) !== -1)
                pars.splice(i, 1);
        url = pars.length == 0 ? urlBase : urlBase + '?' + pars.join('&');
        window.history.pushState('', document.title, url); // added this line to push the new url directly to url bar .
    }
    return url;
}


/***********************************************************************************/

var StringUtils = {};

StringUtils.pascalCase = function (str) {
    return str[0].toUpperCase() + str.substring(1, str.length);
};

StringUtils.isNullOrWhiteSpace = function (str) {
    if (str == null || str.length == 0) return true;
    return str.trim().length == 0;
};

StringUtils.replaceAll = function (str, search, replacement) {
    return str.split(search).join(replacement);
};

StringUtils.plural = function (singularStr, pluralStr, n, dontConcat) {
    if (n == 0 || n >= 2) {
        return dontConcat == undefined || dontConcat == false ?
            (singularStr + pluralStr) : pluralStr;
    }
    return singularStr;
};

StringUtils.nullIfWhitespace = function (str) {
    if (StringUtils.isNullOrWhiteSpace(str))
        return null;
    return str;
}

StringUtils.isValidEmail = function (str) {
    if (StringUtils.isNullOrWhiteSpace(str)) return false;
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return str.trim().match(re);
};

StringUtils.toHtmlLineBreaks = function (str) {
    return str.split('\n').join('<br>');
};

StringUtils.normalizar = function (str) {
    let n = "";
    for (let i = 0; i < str.length; i++) {
        switch (str[i]) {
            // maiúsculo 
            case 'Á':
            case 'Â':
            case 'À':
            case 'Ã':
            case 'Ä':
                n += "A";
                break;

            case 'É':
            case 'Ê':
            case 'È':
            case 'Ë':
                n += "E";
                break;

            case 'Í':
            case 'Î':
            case 'Ì':
            case 'Ï':
                n += "I";
                break;
            case 'Ó':
            case 'Ô':
            case 'Ò':
            case 'Õ':
            case 'Ö':
                n += "O";
                break;

            case 'Ú':
            case 'Û':
            case 'Ù':
            case 'Ü':
                n += "U";
                break;
            case 'Ç':
                n += "C";
                break;

            // minúsculo 
            case 'á':
            case 'â':
            case 'à':
            case 'ã':
            case 'ä':
                n += "a";
                break;

            case 'é':
            case 'ê':
            case 'è':
            case 'ë':
                n += "e";
                break;

            case 'í':
            case 'î':
            case 'ì':
            case 'ï':
                n += "i";
                break;
            case 'ó':
            case 'ô':
            case 'ò':
            case 'õ':
            case 'ö':
                n += "o";
                break;

            case 'ú':
            case 'û':
            case 'ù':
            case 'ü':
                n += "u";
                break;
            case 'ç':
                n += "c";
                break;
            default:
                n += str[i];
                break;
        }
    }
    return n;
}

/***********************************************************************************/


var DropdownUtils = {};

// Inicializa o dropdown.
// params: { onItemChanged, defaultText, replaceAddedItems, multipleSelection }
DropdownUtils.init = function ($dropdown, params) {
    if ($dropdown.data('initialized')) {
        throw 'Dropdown já foi inicializado.';
    }

    if (params == null) params = {};
    $dropdown.data('params', params);
    $dropdown.data('initialized', true);

    var $text = $dropdown.find('.dropdown-toggle .text');

    if (params.defaultText == null) {
        var text = $text.text();

        params.defaultText = !StringUtils.isNullOrWhiteSpace(text) ?
            text : 'Selecione...';
    }
    $text.text(params.defaultText);

    /*****************************************************************/

    if (params.multipleSelection) {
        $dropdown.data('items-selec', []);

        $dropdown.find('.dropdown-toggle .text').after($('<span class="multiple-label">').text('teste'));

    }

    var $search = $dropdown.find('.my-drop-search');

    $dropdown.find('.dropdown-menu').on('click', 'li > a', function () {

        var $li = $(this).parent();
        var key = $li.data('key');

        if (params.multipleSelection != true) {
            // o dropdown não é de múltipla seleção.
            // esconde a lista do dropdown
            $dropdown.removeClass('open');
            DropdownUtils.selectItem($dropdown, key);

            if ($search.length == 1) {
                // esconde o textbox de busca
                $search.fadeOut('normal', function () {
                    // e restaura os itens originais
                    DropdownUtils._generateLis($dropdown);
                });
            }
        } else {
            var itemsSelec = $dropdown.data('items-selec');
            var index = itemsSelec.indexOf(key);

            // o dropdown é de múltipla seleção
            if ($li.hasClass('active')) {
                // remove este item da seleção se estiver ativo
                DropdownUtils.unselectItem($dropdown, key);
            } else {
                // adiciona este item a seleção
                DropdownUtils.selectItem($dropdown, key);
            }
            var $searchInp = $search.find('input');
            if ($searchInp.length == 1) {
                $searchInp.select();
            }
        }
    });

    /***************************************************************
     *  Adiciona os eventos para exibir ou esconder os itens do
     *  Dropdown.
    ****************************************************************/

    // remove a tag data-toggle="dropdown" para evitar com que o bootstrap
    // dê bind em eventos deste dropdown. eles serão feitos manualmente
    $dropdown.find('.dropdown-toggle').attr('data-toggle', '');

    $dropdown.find('.dropdown-toggle').on('click', function (event) {
        $dropdown.toggleClass('open');

        if ($search.length == 1 && $dropdown.hasClass('open')) {
            setTimeout(function () {
                // sempre que o usuário clicar no dropdown, mostrar o textbox de
                // busca em cima do dropdown, para que ele possa pesquisar nos itens.
                $search.find('.my-drop-add-btn').hide();
                $search.fadeIn();
                $search.find('input').focus().val('');
            }, 10);
        }

    });

    var bodyFn = function (e) {
        if (!jQuery.contains(document, $dropdown[0])) {
            // checa se o dropdown foi removido do DOM
            // se foi, tira este bind ao click no body.
            $('body').off('click', bodyFn);
            return;
        }

        if (!$dropdown.is(e.target)
            && $dropdown.has(e.target).length === 0
            && $('.open').has(e.target).length === 0) {
            $dropdown.removeClass('open');

            if ($search.length == 1) {
                // esconde o textbox de busca
                $search.fadeOut('normal', function () {
                    // e restaura os itens originais
                    DropdownUtils._generateLis($dropdown);
                });
            }
        }
    };

    $('body').on('click', bodyFn);

    if ($search.length == 1) {

        /***************************************************************/
        /*   Inicializa os eventos do my-drop-search
        ****************************************************************/

        let $input = $search.find('input');
        let $addBtn = $search.find('.my-drop-add-btn');
        let allowAddItems = $addBtn.length == 1;

        $input.on('input', function (ev) {
            let val = $input.val();
            if (allowAddItems) {
                if (val.length == 0) $addBtn.fadeOut();
                else $addBtn.fadeIn();
            }
            DropdownUtils._generateLis($dropdown, val);
        });

        if (allowAddItems) {
            let addedItems = [];
            ADDED_ITEMS = addedItems;
            $dropdown.data('added-items', addedItems);

            $addBtn.on('click', function () {
                let val = $input.val();
                let key = 'new-' + addedItems.length;
                let items = $dropdown.data('items');

                if (params.replaceAddedItems) {
                    // Remove os itens adicionados pelo usuário
                    for (let i = items.length - 1; i >= 0; i--) {
                        let it = items[i];
                        if (it.newItem) items.splice(i, 1);
                        addedItems.splice(addedItems.indexOf(it.value), 1);
                    }
                }
                addedItems.push(val);
                items.unshift({ key: key, newItem: true, value: val });
                DropdownUtils._generateLis($dropdown);
                DropdownUtils.selectItem($dropdown, key);
            });
        }
    }


};

DropdownUtils._generateLis = function ($dropdown, filter) {
    let items = $dropdown.data('items');
    let fItems = null;
    if (filter != null) {
        fItems = [];
        filter = StringUtils.normalizar(filter.toLowerCase());
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.key == null) {
                fItems.push(item);
            } else {
                let itemNorm = StringUtils.normalizar(item.value.toLowerCase());
                if (itemNorm.indexOf(filter) != -1) {
                    fItems.push(item);
                }
            }
        }
    }

    var multipleSelection = $dropdown.data('params').multipleSelection;
    var itemsSelec = multipleSelection ? $dropdown.data('items-selec') : null;

    var $lis = $.map(fItems != null ? fItems : items, function (el, i) {
        var $li = $('<li>');

        if (el.header != null) {
            $li.addClass('dropdown-header').text(el.header);
        } else if (el.separator == true) {
            $li.addClass('divider').attr('role', 'divider');
        } else if (el.key != null) {
            $li.data('key', el.key).html('<a>' + el.value +
                (multipleSelection ? '<span class="glyphicon glyphicon-ok check"></span>' : '') +
                '</a>');
            if (el.disabled) $li.addClass('disabled');

            else if (multipleSelection && itemsSelec.indexOf(el.key) != -1) {
                $li.addClass('active');
            }
        }
        return $li;
    });

    if ($lis.length == 0) {
        $lis.push($('<li class="disabled"><a>Nenhum item para exibir</a></li>'));
    }
    $dropdown.find('.dropdown-menu').html($lis);
};

// Valida o dropdown checando se ele foi inicializado com .init()
// options: items, multipleSelection
DropdownUtils._validate = function ($dropdown, options) {
    if ($dropdown.length == 0)
        throw new Error('O dropdown não existe. O objeto jQuery informado não contém nenhum elemento.');
    if ($dropdown.data('initialized') != true)
        throw new Error('Dropdown deve ser inicializado antes.');
    if (options != null) {
        if (options.items && $dropdown.data('items') == null)
            throw new Error('A lista do dropdown está nula. Defina os itens utilizando DropdownUtils.setItems.');
        if (options.multipleSelection && $dropdown.data('params').multipleSelection != true)
            throw new Error('O dropdown deve ser de múltipla seleção (multipleSelection) para utilizar esta função.');
    }
}

// Seta os itens do dropdown. items deve ser um array 
// com objetos que contenham os atributos 'key' e 'value'
// e podem ser obtidos utilizando a função DropdownUtils.asDropItems
DropdownUtils.setItems = function ($dropdown, items) {
    DropdownUtils._validate($dropdown);
    $dropdown.data('items', items);
    DropdownUtils._generateLis($dropdown);

    var $formSection = $dropdown.closest('.form-section');
    if ($formSection.length == 0 || $formSection.hasClass('active')) {
        $dropdown.find('.dropdown-toggle').prop('disabled', false);
    }
    DropdownUtils.selectItem($dropdown, null);
};

// Seleciona o item no dropdown pela sua key.
DropdownUtils.selectItem = function ($dropdown, key, preventEvent) {
    DropdownUtils._validate($dropdown);
    var params = $dropdown.data('params');

    if (key == null) {
        DropdownUtils.clear($dropdown);
    } else {
        var match = DropdownUtils.getItem($dropdown, key);
        if (match == null) throw 'Nenhum item com a key ' + key + ' foi encontrado.';

        if (params.multipleSelection) {
            var itemsSelec = $dropdown.data('items-selec');
            // se o item já estiver selecionado, retorna
            if (itemsSelec.indexOf(key) != -1) return;

            if (itemsSelec.length == 0) {
                $dropdown.find('.dropdown-toggle .text').html(match.value).removeClass('no-item');
            } else {
                $dropdown.find('.dropdown-toggle .multiple-label').text('mais ' + itemsSelec.length + ' selecionado(s)');
            }
            itemsSelec.push(key);
            var $li = DropdownUtils.getItemLi($dropdown, key);
            if ($li != null) $li.addClass('active');

        } else {
            $dropdown.data('item-selec', match.key);
            $dropdown.find('.dropdown-toggle .text').html(match.value).removeClass('no-item');
        }
    }

    // não dispara o evento de ItemChanged
    if (preventEvent) return;
    if (params.onItemChanged) params.onItemChanged($dropdown);
};

// Deseleciona o item pela key. Se for um dropdown de seleção única
// ele será limpado. Se for de múltipla seleção, somente o item especificado
// será deselecionado.
DropdownUtils.unselectItem = function ($dropdown, key, preventEvent) {
    DropdownUtils._validate($dropdown);

    if ($dropdown.data('params').multipleSelection) {
        var itemsSelec = $dropdown.data('items-selec');
        var index = itemsSelec.indexOf(key);
        if (index == -1) throw 'Nenhum item com a key ' + key + ' foi encontrado.';
        if (itemsSelec.length == 1) {
            // se for o único item, simplesmente da um clear no dropdown
            DropdownUtils.clear($dropdown);
            return;
        }
        // se não, remove o item e o .active do li
        itemsSelec.splice(index, 1);
        var $li = DropdownUtils.getItemLi($dropdown, key);
        if ($li != null) $li.removeClass('active');

        if (index == 0) {
            // este item é o primeiro, então está no label do dropdown.
            // atribui o texto do segundo item ao label.
            $dropdown.find('.dropdown-toggle .text').html(
                DropdownUtils.getItem($dropdown, itemsSelec[0]).value);
        }
        $dropdown.find('.dropdown-toggle .multiple-label').text(itemsSelec.length > 1 ? 'mais ' + (itemsSelec.length - 1) + ' selecionados' : '');

    } else {
        DropdownUtils.selectItem($dropdown, null, preventEvent);
    }
};

// Limpa todos os itens selecionados atualmente e seleciona todos os especificados 
// no array de keys. Válido somente para os dropdowns de múltipla seleção.
DropdownUtils.selectItems = function ($dropdown, keys) {
    DropdownUtils._validate($dropdown, { items: true, multipleSelection: true });
    DropdownUtils.clear($dropdown);

    var itemsSelec = $dropdown.data('items-selec');
    var items = $dropdown.data('items');

    // itera sobre o array de keys, selecionando os itens 
    // no dropdown (se estiverem na lista atual, pois pode ser
    // que uma busca está em andamento, portanto o item li pode 
    // não existir neste momento)
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (items.indexOf(key) == -1) throw 'Nenhum item com a key ' + key + ' foi encontrado.';
        itemsSelec.push(key);
        var $li = DropdownUtils.getItemLi($dropdown, key);
        if ($li != null) $li.addClass('active');
    }
};

// Transforma os items em dropItems, utilizando o keyProp como
// chave e o valueProp como valor.
DropdownUtils.asDropItems = function (items, keyProp, valueProp) {
    var dropItems = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = (typeof valueProp == 'function') ? valueProp(item) : item[valueProp];

        dropItems.push({
            key: item[keyProp],
            value: value,
            objeto: item
        });
    }
    return dropItems;
};

// Faz o request do params.url e seta os itens no dropdown
// de acordo com o params.keyProp e o params.valueProp.
// Valores de params: { ajaxUrl, ajaxParams, keyProp, valueProp, onLoaded }
DropdownUtils.setItemsFromAjaxGET = function ($dropdown, params) {
    $dropdown.data('is-loading', true);
    DropdownUtils.clear($dropdown, true);
    $.get(params.ajaxUrl, params.ajaxParams, function (result) {
        setTimeout(function () {
            $dropdown.data('is-loading', false);
            var dropItems = DropdownUtils.asDropItems(result, params.keyProp, params.valueProp);

            DropdownUtils.setItems($dropdown, dropItems);
            if (params.onLoaded) params.onLoaded();
        }, 500);

    }).fail(function (e) {
        $dropdown.data('is-loading', false);
        Utils.printError(e);
    });
};

// Inicializa o dropdown e seta os itens utilizando setItemsFromAjaxGET.
// Valores de params: { ajaxUrl, ajaxParams, keyProp, valueProp, onLoaded, onItemChanged, defaultText, multipleSelection }
DropdownUtils.ajaxInit = function ($dropdown, params) {

    DropdownUtils.init($dropdown, {
        onItemChanged: params.onItemChanged,
        defaultText: params.defaultText,
        multipleSelection: params.multipleSelection
    });
    DropdownUtils.setItemsFromAjaxGET($dropdown, params);
};

DropdownUtils.getItem = function ($dropdown, key) {
    DropdownUtils._validate($dropdown, { items: true });

    var items = $dropdown.data('items');

    return $.grep(items, function (el, i) {
        return el.key != null && el.key == key;
    })[0];
};

DropdownUtils.getItemLi = function ($dropdown, key) {
    DropdownUtils._validate($dropdown, { items: true });

    var $lis = $dropdown.find('.dropdown-menu > li');
    return $($.grep($lis, function (li, i) {
        return $(li).data('key') == key;
    })[0]);
};

DropdownUtils.clear = function ($dropdown, disable) {
    DropdownUtils._validate($dropdown);

    var defaultText = $dropdown.data('params').defaultText;
    var text = $dropdown.data('is-loading') == true ?
        'Carregando...' : (defaultText != null ? defaultText : 'Selecione...');

    $dropdown.find('.dropdown-toggle .text').text(text).addClass('no-item');

    var $formSection = $dropdown.closest('.form-section');
    if ($formSection.length == 0 || $formSection.hasClass('active')) {
        $dropdown.find('.dropdown-toggle').prop('disabled', disable == null ? false : disable);
    }
    $dropdown.data('item-selec', null);

    if ($dropdown.data('params').multipleSelection) {
        // zera o array se for de múltipla seleção
        $dropdown.data('items-selec').length = 0;
        $dropdown.find('.dropdown-menu li.active').removeClass('active');
        $dropdown.find('.dropdown-toggle .multiple-label').text('');
    }
};

DropdownUtils.asDropItemsLi = function (items, keyProp, valueProp) {
    let itens = [];
    var htmlLis = "";

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = (typeof valueProp == 'function') ? valueProp(item) : item[valueProp];
        var obj =
        {
            key: item[keyProp],
            value: value,
            objeto: item
        };

        itens.push(obj);
        htmlLis += "<li data-key=\"" + obj.key + "\"><a>" + obj.value + "</a></li>";
    }

    if (itens.length == 0)
        htmlLis = "<li class=\"disabled\"><a>Nenhum item para exibir</a></li>";

    var lista =
    {
        Itens: itens,
        ItensHtml: htmlLis
    };

    return lista;
};

DropdownUtils.setItemsHtml = function ($dropdown, lista) {
    if ($dropdown.data('initialized') != true)
        throw 'Dropdown deve ser inicializado antes.';

    $dropdown.data('items', lista.Itens);
    $dropdown.find('.dropdown-menu').html(lista.ItensHtml);

    $dropdown.find('.dropdown-toggle').prop('disabled', false);
    DropdownUtils.selectItem($dropdown, null);
};

// Utilizar nas funções DropdownUtils.setItemsFromAjax e ajaxInit
// na propriedade valueProp.
// Retorna uma função que transforma o item, colocando o código
// em negrito, concatenando junto ao um outro valor, podendo ser
// a descrição ou nome do objeto.
DropdownUtils.valueTransform = function (key, value) {
    return function (item) {
        return '<b>' + item[key] + '</b> - ' + item[value];
    }
}

DropdownUtils.disableItem = function ($dropdown, key) {

}

/******************************************************************************************/


var ListUtils = {};

// 1. $list - o objeto jQuery da lista (UL)
// 2. items - os itens que serão percorridos para preencher a lista.
// 3. fnEnumerate - função para setar os valores do item da lista. 
//   deve aceitar os seguintes parâmetros:
//      - item
//      - $li
ListUtils.setItems = function ($list, items, fnEnumerate, append) {
    var $lis = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var $li = $list.children('.model.default').clone();
        $li.removeClass('model');
        $li.data('item', item);
        fnEnumerate(item, $li);
        $lis.push($li);
    }

    if (append != true) {
        // se não é para dar append, então remove todos os itens da lista
        // exceto os itens invisíveis com a classe .model
        $list.children(':not(.model)').remove();
        $list.data('items', items.slice());
    } else {
        // se for um append, pega o array atual (se houver)
        // e da um concat com o novo        
        var currentItems = $list.data('items');
        $list.data('items', (currentItems != null ? currentItems : []).concat(items));
    }

    if ($lis.length == 0) {
        // já que não tem nenhum item para ser setado
        // cria um item empty, somente se não existe um item empty ainda e não há nenhum outro item na lista também.
        if ($list.children('.empty:not(.model)').length == 0 && ListUtils.length($list) == 0) {
            var $emptyModel = $list.children('.model.empty');
            if ($emptyModel.length != 0) {
                var $empty = $emptyModel.clone();
                $empty.removeClass('model');
                $lis.push($empty);
            }
        }
    } else if (append == true) {
        $list.children('.end-of-list:not(.model),.empty:not(.model)').remove();
    }

    $list.append($lis);
};

ListUtils.length = function ($list) {
    return $list.children('.default:not(.model)').length;
};

ListUtils.clear = function ($list) {
    $list.children(':not(.model)').remove();
    $list.data('items', []);
};

ListUtils.removeItem = function ($list, index) {
    var li = $list.children(':not(.model)')[index];
    if (li == null) throw 'Não existe um item no index ' + index;
    $(li).remove();
    var items = $list.data('items');
    items.splice(index, 1);
    if (items.length == 0) {
        ListUtils.setItems($list, []);
    }
};

// Mostra um Dialog com um Dropdown permitindo o usuário selecionar um dos 
// itens da lista para adicionar no objeto $list informado. Para usufruir de todas as
// funcionalidades de uma lista mutável pelo usuário, utilize um container .form-group.list 
// com um filho .list-group.
// params:
// 1. $list - O objeto jQuery da lista.
// 2. fnListEnumerate - A função para preencher a lista (neste caso, com append).
// 3. dropAjaxUrl - A URL da action GET para preencher os itens do dropdown.
// 4. dropAjaxParams - Os parâmetros da action GET para preencher os itens do dropdown.
// 5. objectKeyProp - A propriedade key do objeto utilizado na lista e no dropdown (padrão é "id").
// 6. objectValueProp - A propriedade value do objeto utilizado na lista e no dropdown (padrão é "nome").
ListUtils.showAddDialog = function (params) {
    if (params.$list == null || params.fnListEnumerate == null || params.dropAjaxUrl == null)
        throw 'Preencha os campos obrigatórios de params.';
    if (params.objectKeyProp == null) params.objectKeyProp = 'id';
    if (params.objectValueProp == null) params.objectValueProp = 'nome';

    var $model = $('<div class="dialog-model ">' +
        '<div class="dropdown my-drop my-drop-full-width">' +
        '<div class="my-drop-search">' +
        '<input type="text" class="form-control" placeholder="Digite sua pesquisa..." />' +
        '</div>' +
        '<button class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
        '<span class="text"></span>' +
        '<span class="caret"></span>' +
        '</button>' +
        '<ul class="dropdown-menu"></ul>' +
        '</div>' +
        '</div>');

    function fnShowDialog() {
        var $drop = $model.find('.my-drop');

        DropdownUtils.selectItem($drop, null);

        var dialogInfo = Dialog.confirm($model, 'Adicionar', 'Cancelar', null, 'Novo item')
            .onPositiveBtnClick(function () {
                var keysSelected = $drop.data('items-selec');
                if (keysSelected.length == 0) {
                    Dialog.show('Nenhum item foi adicionado.', 'Atenção');
                    return;
                }
                var objsSelected = [];
                // com as chaves dos itens selecionados, obtêm os objetos
                for (var i = 0; i < keysSelected.length; i++) {
                    objsSelected.push(DropdownUtils.getItem($drop, keysSelected[i]).objeto);
                }

                // PS: Não tem chance do usuário selecionar um item 
                // já adicionado, somente se ele der spoof no HTML.

                ListUtils.setItems(params.$list,
                    objsSelected,
                    params.fnListEnumerate, true);

                //fnShowDialog($innerModel, params);
            });

        dialogInfo.$container.find('.dialog').css('overflow', 'visible').css('width', '350px');
    }
    // Inicializa o drop somente uma vez, 
    // para não consumir banda desnecessária

    var $drop = $model.find('.my-drop');

    DropdownUtils.ajaxInit($drop, {
        ajaxUrl: params.dropAjaxUrl,
        ajaxParams: params.dropAjaxParams,
        keyProp: params.objectKeyProp,
        valueProp: params.objectValueProp,
        multipleSelection: true,
        // quando a action do drop carregar, 
        // abre o Dialog
        onLoaded: function () {

            var dropItems = $drop.data('items');
            var listItems = params.$list.data('items');

            for (var i = 0; i < dropItems.length; i++) {
                var dropItem = dropItems[i];
                for (var j = 0; j < listItems.length; j++) {
                    var listItem = listItems[j];
                    if (listItem[params.objectKeyProp] == dropItem.key) {
                        // o item já foi adicionado na lista
                        // desabilita para que o usuário não consiga
                        // adicioná-lo novamente.
                        dropItem.disabled = true;
                    }
                }
            }
            DropdownUtils._generateLis($drop);
        }
    });

    fnShowDialog();

};

ListUtils.showAddDialogEx = function (params) {
    var $model = $('<div class="dialog-model">\
                       <div class="dropdown my-drop my-drop-full-width">\
                          <div class="my-drop-search">\
                             <input type="text" class="form-control" placeholder="Digite sua pesquisa..."/>\
                          </div>\
                          <button class="btn btn-default dropdown-toggle" data-toggle="dropdown">\
                             <span class="text"></span>\
                             <span class="caret"></span>\
                          </button>\
                          <ul class="dropdown-menu"></ul>\
                       </div>\
                    </div>');

    function fnShowDialog() {
        var $drop = $model.find('.my-drop');
        $drop.find(".dropdown-menu").css("max-width", "unset");
        DropdownUtils.selectItem($drop, null);

        var dialogInfo = Dialog.confirm($model, 'Adicionar', 'Cancelar', null, 'Adicionar item').onPositiveBtnClick(function () {
            var key = $drop.data('item-selec');
            var item = null;

            if (key == null) {
                Dialog.show('Nenhum item selecionado!', 'Atenção');
                return;
            }

            if (key != null)
                item = DropdownUtils.getItem($drop, key).objeto;

            params.onSelect(item);
        });

        dialogInfo.$container.find('.dialog').css('overflow', 'visible').css('width', '350px');
    }

    var $drop = $model.find('.my-drop');

    DropdownUtils.ajaxInit($drop,
        {
            ajaxUrl: params.dropAjaxUrl,
            ajaxParams: params.dropAjaxParams,
            keyProp: params.objectKeyProp,
            valueProp: params.objectValueProp,
        });

    fnShowDialog();
};

/************************************************************************************************/

var ExplodingIcon = {};

ExplodingIcon.show = function ($el, bootstrapIcon) {
    var $icon = $('<span class="exploding-icon glyphicon glyphicon-' + bootstrapIcon + '">');
    var elOffset = $el.offset();

    var $window = $(window);
    $icon.css('left', elOffset.left + $el.width());
    $icon.css('top', elOffset.top);
    $(document.body).append($icon);

    setTimeout(function () {
        $icon.on('transitionend', function (event) {
            if (event.originalEvent.propertyName == 'opacity') {
                if ($icon.css('opacity') == 1) {
                    setTimeout(function () {
                        $icon.css('opacity', 0);
                    }, 200);

                } else {
                    // opacity terminou de animar para 0,
                    // remove o elemento da página.
                    $icon.remove();
                }
            }
        });
        $icon.addClass('active');
    }, 10);
};


/*****************************************************************************************************/

//var ServerUtils = {};

//ServerUtil.Log = function () {

//};

var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
    },
    searchString: function (data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) !== -1) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }

        var rv = dataString.indexOf("rv:");
        if (this.versionSearchString === "Trident" && rv !== -1) {
            return parseFloat(dataString.substring(rv + 3));
        } else {
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        }
    },

    dataBrowser: [
        { string: navigator.userAgent, subString: "Edge", identity: "MS Edge" },
        { string: navigator.userAgent, subString: "MSIE", identity: "Explorer" },
        { string: navigator.userAgent, subString: "Trident", identity: "Explorer" },
        { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
        { string: navigator.userAgent, subString: "Opera", identity: "Opera" },
        { string: navigator.userAgent, subString: "OPR", identity: "Opera" },

        { string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
        { string: navigator.userAgent, subString: "Safari", identity: "Safari" }
    ]
};

/*******************************************************************************************************/

// Retorna a representação em string da data do datepicker. 
// Pega o dia, mês e ano no formato UTC para evitar
// o problema do GMT -3, em horário de verão torna-se -2,
// (fazendo com que o dia 19 de fev de 2017 seja dia 18 
// de fev as 23 horas)
Utils.getFixedDateStr = function (date) {
    if (date == null) return null;
    var dateStr = Utils.zeroPad(date.getUTCDate(), 2) + '/' + Utils.zeroPad(date.getUTCMonth() + 1, 2) + '/' + date.getUTCFullYear();
    return dateStr;
};

/*********************************************************************************************************/

// Number((-2999240.264).toFixed(1)).toLocaleString()


var NumberUtils = {};

NumberUtils.formatNumber = function (number, decimalPlaces, decimalChar, milharChar) {
    decimalPlaces = decimalPlaces == undefined ? 2 : decimalPlaces;
    decimalChar = decimalChar == undefined ? "," : decimalChar;
    milharChar = milharChar == undefined ? "." : milharChar;
    var s = number < 0 ? "-" : "";
    i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decimalPlaces))),
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + milharChar : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + milharChar) + (decimalPlaces ? decimalChar + Math.abs(number - i).toFixed(decimalPlaces).slice(2) : "");
};

NumberUtils.parse = function (n) {
    if (typeof (n) == 'number') return n;
    if (StringUtils.isNullOrWhiteSpace(n)) return null;

    n = StringUtils.replaceAll(n, '.', '');
    n = StringUtils.replaceAll(n, ',', '.');
    var nAsNumber = Number(n);
    if (isNaN(nAsNumber)) return null;
    return nAsNumber;

};

/*********************************************************************************************************/

var BtnState = {};

BtnState.disable = function ($btn) {
    $btn.prop('disabled', true);
    if ($btn.data('text-enabled') == null)
        $btn.data('text-enabled', $btn.html());
    if ($btn.data('text-disabled') != null)
        $btn.html($btn.data('text-disabled'));
};

BtnState.enable = function ($btn) {
    $btn.prop('disabled', false);
    $btn.html($btn.data('text-enabled'));
}

/*********************************************************************************************************/

var DateUtils = {};

DateUtils.getDate = function (date) {
    if (typeof date == 'number')
        return new Date(date);
    else if (!(date instanceof Date))
        throw 'O objeto data está em um formato inválido';
    return date;
}

DateUtils.literalDiff = function (date, haInsteadOfAtras) {
    date = DateUtils.getDate(date);
    var now = new Date();
    var diffSecs = (now.getTime() - date.getTime()) / 1000;
    var diffMins = diffSecs / 60;
    var diffHours = diffMins / 60;
    var diffDays = diffHours / 24;
    var diffMonths = diffDays / 30;
    var diffYears = diffMonths / 12;

    if (diffSecs < 60)
        return 'agora';

    var literal = haInsteadOfAtras ? 'há ' : '';

    if (diffMins < 60)
        literal += Math.floor(diffMins) + ' ' + StringUtils.plural('minuto', 's', diffMins);

    else if (diffHours < 24)
        literal += Math.floor(diffHours) + ' ' + StringUtils.plural('hora', 's', diffHours);

    else if (diffDays < 30)
        literal += Math.floor(diffDays) + ' ' + StringUtils.plural('dia', 's', diffDays);

    else if (diffMonths < 12)
        literal += Math.floor(diffMonths) + ' ' + StringUtils.plural('mês', 'meses', diffMonths, true);

    else
        literal += Math.floor(diffYears) + ' ' + StringUtils.plural('ano', 's', diffYears);

    if (!haInsteadOfAtras) literal += ' atrás';

    return literal;
};

/***********************************************************************************************************/

var Filepicker = {

    typesImage: ['PNG', 'JPG', 'JPEG'],


    // - $filePicker: O objeto jquery que representa o filepicker
    // - options:
    //      - typesAccepted: os tipos de arquivos aceitos por este filepicker.
    //      - maxFileSize: o tamanho máximo aceito por cada arquivo em KB.
    //      - maxFileNumber: a quantidade máxima de arquivos.
    init: function ($filepicker, options) {
        var that = this;

        if (options == null) options = {};
        $filepicker.data('fp-options', options);
        var $filesContainer = $filepicker.find('.files-container');

        $filepicker.find('input[type=file]').on('change', function () {

            if (this.files.length == 0) return;

            var invalidFiles = false;
            var $filesFrames = [];
            var fpFiles = $filepicker.data('fp-files');

            if (options.maxFileNumber && (this.files.length + fpFiles.length) > options.maxFileNumber) {
                Dialog.show('Por favor, selecione no máximo ' + options.maxFileNumber + ' arquivo(s).');
                return;
            } else {
                for (var i = 0; i < this.files.length; i++) {
                    var file = this.files[i];

                    var fileName = file.name.split('.');
                    var extension = fileName[fileName.length - 1];

                    if (fileName.length < 2) {
                        Dialog.show('O arquivo "' + file.name + '" não possui uma extensão definida.');
                        return;
                    }
                    extension = extension.toUpperCase();

                    if (options.typesAccepted && options.typesAccepted.indexOf(extension) == -1) {
                        Dialog.show('O formato do arquivo "' + file.name + '" não é suportado.\n\nPor favor, selecione um arquivo que possua um dos seguintes formatos: ' + options.typesAccepted.join(', '));
                        return;
                    }

                    var fileSizeKB = file.size / 1024;

                    if (options.maxFileSize && fileSizeKB > options.maxFileSize) {
                        // TODO: utilizar função para dividir se for megabytes para melhor instruir o usuário...
                        // E deixar somente uma casa decimal (somente se for diferente de 0)
                        Dialog.show('Arquivos maiores do que ' + options.maxFileSize + ' KB não são permitidos. O arquivo ' + file.name + ' possui ' + fileSizeKB.toFixed(0) + ' KB.');
                        return;
                    }

                    // Checa para ver se este arquivo é igual a 
                    // algum dos arquivos já adicionados.
                    for (var j = 0; j < fpFiles.length; j++) {
                        var f = fpFiles[j];
                        if (f.constructor == File && f.name == file.name && f.size == file.size && f.lastModified == file.lastModified) {
                            Dialog.show('O arquivo "' + file.name + '" já foi adicionado.');
                            return;
                        }
                    }
                }
            }

            ///////////////////////////////////////////////////////////////////

            that._generateFileFrames($filepicker, this.files);
        });

        $filesContainer.on('click', '.file-frame', function () {
            var index = $(this).index();
            if (index == -1) return;
            that._selectImg($filepicker, index);
        });

        $filesContainer.on('click', '.file-frame .remove', function () {
            var $frame = $(this).closest('.file-frame');
            var fpFiles = $filepicker.data('fp-files');

            let fileToRemove = fpFiles[$frame.index()];
            // Se é um arquivo local, então foi carregado a partir de um blob
            if (fileToRemove.constructor == File) {
                // obtém a thumbnail e libera a memória
                var blobUrl = $frame.find('.img-frame img').prop('src');
                window.URL.revokeObjectURL(blobUrl);
            }

            fpFiles.splice($frame.index(), 1);
            $frame.remove();

            if (fpFiles.length > 0)
                that._selectImg($filepicker, 0);
            else
                $filepicker.find('.filepicker-lbl').val('');
        });

        that.clear($filepicker);
    },

    _selectImg: function ($filepicker, i) {
        var fpFiles = $filepicker.data('fp-files');
        var fileSelected = fpFiles[i];

        // Só mostra o index da seleção se houver mais do que um arquivo selecionado.
        $filepicker.find('.filepicker-lbl').val((fpFiles.length > 1 ? '(' + (i + 1) + ') ' : '') + fileSelected.name);
        var $imgFrames = $filepicker.find('.files-container .img-frame');
        $imgFrames.removeClass('active');
        $($imgFrames[i]).addClass('active');
    },

    clear: function ($filepicker) {
        $filepicker.find('.filepicker-lbl').val('');
        $filepicker.find('.files-container').empty();
        let fpFiles = $filepicker.data('fp-files');
        let $frames = $filepicker.find('.files-container .file-frame');

        for (let i = 0; i < $frames.length; i++) {
            let file = fpFiles[i];
            if (file.constructor == File) {
                var blobUrl = $frames[i].find('.img-frame img').prop('src');
                window.URL.revokeObjectURL(blobUrl);
            }
        }
        $filepicker.data('fp-files', []);
    },

    // [Beta]
    // Note that only images are supported.
    // options: {
    //      files: Os arquivos a serem selecionados,
    //      nameKey: A propriedade do objeto em files que contém o nome do arquivo,
    //      urlKey: A propriedade do objeto em files que contém a URL do arquivo
    // }
    loadSelectionFromServer: function ($filepicker, options) {
        let files = options.files;
        let fpFiles = $filepicker.data('fp-files');
        let newFiles = [];

        let maxFileNumber = $filepicker.data('fp-options').maxFileNumber;
        if (fpFiles.length + files.length > maxFileNumber) {
            throw new Error('Não foi possível adicionar os arquivos no Filepicker. Isso ultrapassaria o limite (' + maxFileNumber + ' arquivos) definido nas opções .');
        }

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            newFiles.push({
                isRemoteFile: true,
                name: file[options.nameKey],
                remoteUrl: LinkUtil.getUrl(file[options.urlKey])
            });
        }
        this._generateFileFrames($filepicker, newFiles);
    },

    _generateFileFrames: function ($filepicker, newFiles) {
        let $newFileFrames = [];
        let fpFiles = $filepicker.data('fp-files');

        for (let i = 0; i < newFiles.length; i++) {
            let file = newFiles[i];

            let $fileFrame = $(
                '<div class="file-frame">' +
                '<i class="mi remove">clear</i>' +
                '<div class="img-frame card">' +
                '</div>' +
                '</div>'
            );

            let extension = this._getFileType(file.name);

            // Se é uma imagem, carrega o preview.
            if (Filepicker.typesImage.indexOf(extension) != -1) {
                // Se é uma imagem local (do computador do usuário)
                // cria um blob para o acesso do arquivo,
                // Se for imagem remote (isRemoteFile), utiliza a url
                // fornecida no objeto (remoteUrl).

                let fileUrl = file.constructor == File ?
                    window.URL.createObjectURL(file) : file.remoteUrl;

                ImageFrame.loadCenter($fileFrame.find('.img-frame'), fileUrl);
            } else {
                // Preview deste arquivo não está disponível. 
                // Mostra somente o formato do arquivo.

                ImageFrame.previewNotAvailable($fileFrame.find('.img-frame'), extension, '#ca0606');
            }
            $newFileFrames.push($fileFrame);
            fpFiles.push(file);
        }
        let $filesContainer = $filepicker.find('.files-container');
        $filesContainer.append($newFileFrames);
        // seleciona o primeiro dos arquivos recém adicionados
        this._selectImg($filepicker, fpFiles.length - newFiles.length);
    },

    _getFileType: function (fileName) {
        let nameParts = fileName.split('.');
        if (nameParts.length < 2) return null;
        let extension = nameParts[nameParts.length - 1];
        return extension.toUpperCase();
    }

};

/******************************************************************************************************************/


var ImageFrame =
{
    clear: function ($imgFrame) {
        var $img = $imgFrame.find('.img');
        var $imgBlur = $imgFrame.find('.img-blur');

        $img.hide();
        $imgBlur.hide();
    },

    // Atualmente a função loadBlurred carrega
    // a imagem 4x3, se o frame não possuir esta
    // proporção, então ele irá recalcular o height
    // do frame baseando-se no width atual.

    loadBlurred: function ($imgFrame, url) {
        var that = this;

        var img = new Image();
        img.onload = function () {

            var frameWidth = $imgFrame.width();
            var frameHeight = $imgFrame.height();

            var proporcaoBase = 4 / 3;
            var proporcaoImg = img.width / img.height;

            if ((frameWidth / frameHeight) != proporcaoBase) {
                // inicializa o height deste ImageFrame para ser 4x3
                frameHeight = frameWidth / proporcaoBase;
                $imgFrame.height(frameHeight);
            }
            $imgFrame.data('if-url', url);

            ////////////////////////////////////////////////////

            var $img = $imgFrame.find('.img');
            var $imgBlur = $imgFrame.find('.img-blur');

            if (proporcaoImg > proporcaoBase) {
                // largura é MAIOR do que deveria ser
                // utiliza toda a largura e o proporcional da altura
                $img.width(frameWidth);
                $img.height(frameWidth / proporcaoImg);
                // centraliza o div verticalmente
                $img.css('left', 0);
                $img.css('top', that._calculateOffset($img.height(), frameHeight));
            }
            else if (proporcaoImg < proporcaoBase) {
                // largura é MENOR doq deveria ser
                // utiliza toda a altura e o proporcional da largura
                $img.height(frameHeight);
                $img.width(frameHeight * proporcaoImg);
                // centraliza o div horizontalmente
                $img.css('top', 0);
                $img.css('left', that._calculateOffset($img.width(), frameWidth));
            }
            else {
                $img.width(frameWidth);
                $img.height(frameHeight);
                $img.css('top', 0);
                $img.css('left', 0);
            }

            ////////////////////////////////////////////////////

            $img.one('load', function () {
                $img.fadeIn('normal');
            });
            $img.prop('src', url);

            if (BrowserDetect.browser == "Explorer") {
                $imgBlur.hide();
            }
            else if (proporcaoImg != proporcaoBase) {
                $imgBlur
                    .css('background-image', 'url("' + url + '")')
                    .fadeIn();
            }
        };
        img.src = url;
    },

    loadCenter: function ($imgFrame, url, onload) {
        var that = this;

        var img = new Image();
        img.onload = function () {

            var $img = $imgFrame.find('img');
            if ($img.length == 0) {
                $img = $('<img>');
                $imgFrame.append($img);
            }

            var proporcao = img.width / img.height;
            $imgFrame.data('if-proporcao', proporcao);
            $imgFrame.data('if-url', url);
            $img.prop('src', url);
            that._setOffset($imgFrame);

            $(window).on('resize', function () {
                ImageFrame._setOffset($imgFrame);
            });

            if (onload != null) onload();
        };
        img.src = url;
    },

    previewNotAvailable: function ($imgFrame, extension, color) {
        // o arquivo não é uma imagem. escreve o seu formato em letras maiúsculas.
        $imgFrame.html('<span><i class="mi pna-i">insert_drive_file</i>' + extension.toUpperCase() + '</span>')
            .addClass('pna not-selectable')
            .css('color', color);
    },

    _calculateOffset: function (imgSize, frameSize) {
        return ((((frameSize / 2) - (imgSize / 2)) / frameSize) * 100) + '%';
    },

    _setOffset: function ($imgFrame) {
        var $img = $imgFrame.find('img');

        var frameWidth = $imgFrame.width();
        var frameHeight = $imgFrame.height();

        var proporcaoFrame = frameWidth / frameHeight;
        var proporcaoImg = $imgFrame.data('if-proporcao');

        ////////////////////////////////////////////////////

        if (proporcaoImg > proporcaoFrame) {
            // a imagem é maior horizontalmente do que o frame.
            // preenche a altura total da imagem no frame e 
            // e centraliza ela horizontalmente

            $img.height(frameHeight);
            var imgWidth = frameHeight * proporcaoImg;
            $img.width(imgWidth);
            $img.css('left', -((imgWidth - frameWidth) / 2));
            $img.css('top', 0);
        } else if (proporcaoImg < proporcaoFrame) {
            // a imagem é maior verticalmente do que o frame.
            // preenche a largura total da imagem no frame e 
            // e centraliza ela verticalmente

            $img.width(frameWidth);
            var imgHeight = frameWidth / proporcaoImg;
            $img.height(imgHeight);
            $img.css('top', -((imgHeight - frameHeight) / 2));
            $img.css('left', 0);
        } else {
            // a imagem tem a proporção exata do frame, simplesmente
            // encaixa a imagem sem realizar nenhum ajuste.

            $img.width(frameWidth);
            $img.height(frameHeight);
            $img.css('top', 0);
            $img.css('left', 0);
        }
    }
};

/******************************************************************************************************************/

var LinkUtil =
{
    getUrl: function (arqId) {
        return thingy() + '/intranet/arquivos/' + arqId;
    }

};

/******************************************************************************************************************/

var DataTableTranslation =
{
    "sEmptyTable": "Nenhum registro encontrado",
    "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
    "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
    "sInfoFiltered": "(Filtrados de _MAX_ registros)",
    "sInfoPostFix": "",
    "sInfoThousands": ".",
    "sLengthMenu": "_MENU_ resultados por página",
    "sLoadingRecords": "Carregando...",
    "sProcessing": "Processando...",
    "sZeroRecords": "Nenhum registro encontrado",
    "sSearch": "Pesquisar",
    "oPaginate": {
        "sNext": "Próximo",
        "sPrevious": "Anterior",
        "sFirst": "Primeiro",
        "sLast": "Último"
    },
    "oAria": {
        "sSortAscending": ": Ordenar colunas de forma ascendente",
        "sSortDescending": ": Ordenar colunas de forma descendente"
    }
};

/******************************************************************************************************************/

var FloatingForm = {

    init: function ($container) {
        this._validate($container);

        $container.find('.floating-form').on('click', function (e) {
            //e.stopPropagation(); 
            // não pode usar o stopPropagation
            // pois se não buga o dropdown.
            $container.data('prevent-close', true);
        });

        $container.on('click', function () {
            if ($container.data('prevent-close') == true) {
                $container.data('prevent-close', false);
                return;
            }

            FloatingForm.hide($container);
        });

        $container.data('ff-init', true);
    },

    show: function ($container) {
        this._validate($container);

        $container.fadeIn('fast', function () {
            $container.find('.floating-form').addClass('active');
        });
    },

    hide: function ($container) {
        this._validate($container);

        $container.find('.floating-form').removeClass('active');
        setTimeout(function () {
            $container.fadeOut('fast');
        }, 400);
    },

    _validate: function ($container) {
        if (!$container.hasClass('floating-form-container'))
            throw 'O $container deve possuir a classe floating-form-container';

        if ($container.find('.floating-form').length == 0)
            throw 'O $container deve possuir um filho com a classe floating-form';

        if ($container.data('ff-init') == false)
            throw 'O $container deve ser inicializado com FlotaingForm.init';
    }
};

/******************************************************************************************************************/

var InputMaskUtils = {

    getDecimalArgs: function (additional) {
        return Object.assign({
            /*'min': 0,*/ 'radixPoint': ',', 'groupSeparator': '.', 'allowMinus': false, 'rightAlign': false
        }, additional);
    }
};

/******************************************************************************************************************/

var DatePickerUtils = {
    getArgs: function () {
        return {
            todayHighlight: true,
            format: 'dd/mm/yyyy',
            orientation: 'auto top'
        };
    }
};

/******************************************************************************************************************/

var FormSection = {

    enable: function ($form, enable) {

        if (enable) {
            $form.addClass('active');
        } else {
            $form.removeClass('active');
        }
        $form.find('button').prop('disabled', !enable);
    }
};
