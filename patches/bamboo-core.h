#pragma once

#include <stdbool.h>
#include <stdint.h>

typedef const char cchar;

typedef struct {
    bool autoNonVnRestore;
    bool ddFreeStyle;
    bool macroEnabled;
    bool autoCapitalizeMacro;
    bool spellCheckWithDicts;
    const char *outputCharset;
    bool modernStyle;
    bool freeMarking;
} FcitxBambooEngineOption;

#ifdef __cplusplus
extern "C" {
#endif

void Init(void);
uint8_t EngineProcessKeyEvent(uintptr_t engine, uint32_t keyVal,
                              uint32_t state);
void EngineSetRestoreKeyStroke(uintptr_t engine);
char *EnginePullPreedit(uintptr_t engine);
void EngineCommitPreedit(uintptr_t engine);
char *EnginePullCommit(uintptr_t engine);
void EngineSetOption(uintptr_t engine, FcitxBambooEngineOption *option);
uintptr_t NewEngine(cchar *name, uintptr_t dictHandle, uintptr_t tableHandle);
uintptr_t NewCustomEngine(char **definition, uintptr_t dictHandle,
                          uintptr_t tableHandle);
uintptr_t NewMacroTable(char **definition);
void DeleteObject(uintptr_t handle);
void ResetEngine(uintptr_t engine);
char **GetCharsetNames(void);
char **GetInputMethodNames(void);
uintptr_t NewDictionary(uintptr_t fd);

#ifdef __cplusplus
}
#endif
