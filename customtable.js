function CustomTable(table) {
    var offsetTop = 0;
    var scroller = table.parentNode; // .table-responsive

    // clone table and header
    var frozenTable = table.cloneNode();
    frozenTable.classList.add('table-clone');
    var frozenTHead = frozenTable.appendChild(table.tHead);
    var frozenTHRow = frozenTable.appendChild(document.createElement('tr'));

    // append to DOM
    table.insertBefore(frozenTHead.cloneNode(true), table.firstElementChild);
    table.parentNode.insertBefore(frozenTable, table);

    // handle resize
    var scrollerRect, tHeadRect;
    resize();
    window.addEventListener('resize', resize);

    function resize() {
        scrollerRect = scroller.getBoundingClientRect();
        tHeadRect = table.tHead.getBoundingClientRect();
        frozenTHRow.style.width = scrollerRect.width + 'px';
        frozenTable.style.width = tHeadRect.width + 'px';
        frozenTHead.style.clip = getClipRect(scroller.scrollLeft, scrollerRect.width);

        var borderCollapse = table.style.borderCollapse;
        table.style.borderCollapse = 'separate';
        frozenTHead.style.height = frozenTHRow.style.height = table.tHead.rows[0].offsetHeight + 'px';
        table.style.borderCollapse = borderCollapse;

        for (var r = 0; r < table.tHead.rows.length; r++) {
            var row = table.tHead.rows[r];
            var frozenRow = frozenTable.tHead.rows[r];

            for (var c = 0; c < row.cells.length; c++) {
                var cell = row.cells[c];
                var width = cell.getBoundingClientRect().width;

                var style = window.getComputedStyle(cell);
                if (style.getPropertyValue('box-sizing') !== 'border-box') {
                    width -= parseFloat(style.getPropertyValue('border-left'));
                    width -= parseFloat(style.getPropertyValue('border-right'));
                    width -= parseFloat(style.getPropertyValue('padding-left'));
                    width -= parseFloat(style.getPropertyValue('padding-right'));
                }

                var frozenCell = frozenRow.cells[c];
                frozenCell.style.maxWidth =
                frozenCell.style.minWidth = width + 'px';
            }
        }
    }

    // called when scrolling starts
    function onscrollstart() {
        var tableRect = frozenTable.getBoundingClientRect();
        scroller.classList.add('scrolling');
        frozenTHead.style.clip = '';
        frozenTHead.style.top = -tableRect.top + offsetTop + 'px';
        frozenTHead.style.transform = '';
    }

    // called when scrolling ends
    function onscrollstop() {
        scroller.classList.remove('scrolling');
        frozenTHead.style.clip = getClipRect(scroller.scrollLeft, scrollerRect.width);
        frozenTHead.style.top = offsetTop + 'px';
        frozenTHead.style.transform = 'translateX(' + -scroller.scrollLeft + 'px)';
    }

    var touchphase = 0;
    var scrolling = false;
    var scrollTimeoutID;
    function cancelScroll() {
        if (scrolling) {
            scrolling = false;
            clearTimeout(scrollTimeoutID);
            onscrollstop();
        }
    }

    // determine if table header should be frozen
    var frozenTCell = table.tHead.rows[0].cells[0].firstElementChild;
    var frozen = false;

    if (offsetTop === 0) {
        frozen = true;
        frozenTable.classList.add('frozen');
    }

    window.addEventListener('scroll', function () {
        cancelScroll();
        if (table.getBoundingClientRect().top > offsetTop) {
            if (frozen === true) {
                frozen = false;
                frozenTable.classList.remove('frozen');
                frozenTHead.style.top = '';
                frozenTHRow.style.top = '';
                frozenTCell.style.top = '';
            }
        } else {
            if (frozen === false) {
                frozen = true;
                frozenTable.classList.add('frozen');
                frozenTHead.style.top = offsetTop + 'px';
                frozenTHRow.style.top = offsetTop + 'px';
                frozenTCell.style.top = offsetTop + 'px';
            }
        }
    });

    // use touch events to determine touchphase
    scroller.addEventListener('touchstart', function () {
        touchphase = 1;
        cancelScroll();
    });

    scroller.addEventListener('touchmove', function () {
        touchphase = 2;
    });

    scroller.addEventListener('touchend', touchstop);
    scroller.addEventListener('touchcancel', touchstop);

    function touchstop() {
        if (touchphase === 2 && !scrolling) onscrollstop();
        touchphase = 0;
    }

    // use scroll events to determine when we're scrolling
    scroller.addEventListener('scroll', function () {
        clearTimeout(scrollTimeoutID);

        if (touchphase === 1) {
            onscrollstop();
            return;
        }

        if (!scrolling) {
            scrolling = true;
            onscrollstart();
        }

        scrollTimeoutID = setTimeout(function () {
            if (scrolling) {
                scrolling = false;
                if (touchphase !== 2) onscrollstop();
            }
        }, 100);
    });

    function getClipRect(left, width) {
        return 'rect(auto, ' + (left + width) + 'px, auto, ' + left + 'px)';
    }
}
