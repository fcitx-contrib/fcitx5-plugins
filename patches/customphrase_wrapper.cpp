#include "../fcitx5-chinese-addons/im/pinyin/customphrase.h"
#include <fstream>
#include <string>

#define KEEP __attribute__((used, visibility("default")))

extern "C" {

KEEP void *customphrase_create() { return new fcitx::CustomPhraseDict(); }

KEEP void customphrase_destroy(void *p) {
    delete static_cast<fcitx::CustomPhraseDict *>(p);
}

KEEP void customphrase_load(void *p, const char *path) {
    auto *dict = static_cast<fcitx::CustomPhraseDict *>(p);
    std::ifstream in(path);
    if (in) {
        dict->load(in, true);
    }
}

KEEP void customphrase_save(void *p, const char *path) {
    auto *dict = static_cast<fcitx::CustomPhraseDict *>(p);
    std::ofstream out(path);
    if (out) {
        dict->save(out);
    }
}

KEEP void customphrase_add(void *p, const char *key, const char *value,
                           int order) {
    auto *dict = static_cast<fcitx::CustomPhraseDict *>(p);
    dict->addPhrase(key, value, order);
}

typedef void (*CustomPhraseCallback)(const char *key, const char *value,
                                     int order, void *userData);

KEEP void customphrase_foreach(void *p, CustomPhraseCallback callback,
                               void *userData) {
    auto *dict = static_cast<fcitx::CustomPhraseDict *>(p);
    dict->foreach ([callback,
                    userData](const std::string &key,
                              std::vector<fcitx::CustomPhrase> &items) {
        for (const auto &item : items) {
            callback(key.c_str(), item.value().c_str(), item.order(), userData);
        }
    });
}
}
