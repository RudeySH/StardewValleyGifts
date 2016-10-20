var categoryIdExceptions = {};
categoryIdExceptions['80'] = null; // quartz

// Artisan Goods
categoryIdExceptions['395'] = '-26'; // coffee
categoryIdExceptions['724'] = '-26'; // maple syrup
categoryIdExceptions['725'] = '-26'; // oak resin
categoryIdExceptions['726'] = '-26'; // pine tar

// Tree Fruit
categoryIdExceptions['613'] = '-79.1'; // apple
categoryIdExceptions['634'] = '-79.1'; // apricot
categoryIdExceptions['635'] = '-79.1'; // orange
categoryIdExceptions['636'] = '-79.1'; // peach
categoryIdExceptions['637'] = '-79.1'; // pomegranate
categoryIdExceptions['638'] = '-79.1'; // cherry

function getCategoryId(objectId) {
    var categoryId = categoryIdExceptions[objectId];
    if (categoryId !== undefined) return categoryId;
    return getCategoryId2(objectId);
}

function getCategoryId2(objectId) {
    var info = content.data.objectInformation[objectId];
    if (info !== undefined) {
        var match = info.split('/')[3].match(/-\d+$/);
        if (match !== null) return match[0];
    }
}

function getNPCs() {
    var uni = { name: 'Universal', all: [] };
    var npcs = [uni];

    for (var name in content.data.npcGiftTastes) {
        var giftTastes = content.data.npcGiftTastes[name];

        switch (name) {
            case 'Universal_Love':
                uni.love = giftTastes.split(' ');
                uniquify(uni, 'love');
                break;

            case 'Universal_Like':
                uni.like = giftTastes.split(' ');
                uni.like.push('-79.1');
                uniquify(uni, 'like');
                break;

            case 'Universal_Neutral':
                uni.neutral = giftTastes.split(' ');
                uniquify(uni, 'neutral');
                break;

            case 'Universal_Dislike':
                uni.dislike = giftTastes.split(' ');
                uniquify(uni, 'dislike');
                break;

            case 'Universal_Hate':
                uni.hate = giftTastes.split(' ');
                uniquify(uni, 'hate');
                break;

            default:
                var npc = { name: name, all: [] };
                npcs.push(npc);

                giftTastes = giftTastes.trim().split('/');
                npc.neutral = giftTastes[9].split(' ');
                npc.hate = giftTastes[7].split(' ');
                npc.dislike = giftTastes[5].split(' ');
                npc.love = giftTastes[1].split(' ');
                npc.like = giftTastes[3].split(' ');

                for (var id in categoryIdExceptions) {
                    var objId = id;
                    if (npc.neutral.indexOf(objId) !== -1 || npc.dislike.indexOf(objId) !== -1 || npc.hate.indexOf(objId) !== -1) continue;
                    if (uni.neutral.indexOf(objId) !== -1 || uni.dislike.indexOf(objId) !== -1 || uni.hate.indexOf(objId) !== -1) continue;

                    var catId = categoryIdExceptions[objId];
                    if (catId === null) {
                        catId = getCategoryId2(objId);
                        if (npc.neutral.indexOf(catId) !== -1 || npc.dislike.indexOf(catId) !== -1 || npc.hate.indexOf(catId) !== -1) continue;
                    } else if (catId !== undefined) {
                        if (npc.neutral.indexOf(catId) === -1 && npc.dislike.indexOf(catId) === -1 && npc.hate.indexOf(catId) === -1) continue;
                    }

                    npc.like.push(id);
                }

                npc.neutralDialog = giftTastes[8];
                uniquify(npc, 'neutral');

                npc.hateDialog = giftTastes[6];
                uniquify(npc, 'hate');

                npc.loveDialog = giftTastes[0];
                uniquify(npc, 'love');

                npc.likeDialog = giftTastes[2];
                uniquify(npc, 'like');

                npc.dislikeDialog = giftTastes[4];
                uniquify(npc, 'dislike');
                break;
        }
    }

    function uniquify(npc, prop) {
        var isUniversal = npc === uni;
        npc[prop] = npc[prop].filter(function (objId, index) {
            var catId;
            if (objId > 0 && (isUniversal || prop !== 'like' || categoryIdExceptions[objId] === undefined)) catId = getCategoryId(objId);

            return (isUniversal || (!catId || uni[prop].indexOf(catId) === -1) && uni[prop].indexOf(objId) === -1)
                && npc[prop].indexOf(objId) === index && npc.all.indexOf(objId) === -1;
        });
        npc.all.push.apply(npc.all, npc[prop]);
    }

    return npcs;
}
