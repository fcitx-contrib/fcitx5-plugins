#include "bamboo-core.h"

#include <array>
#include <cstdlib>
#include <cstring>
#include <emscripten.h>
#include <new>
#include <stdexcept>
#include <string>
#include <unistd.h>
#include <vector>

// clang-format off
EM_JS(void, fcitx_bamboo_wasm_init, (), {
    if (globalThis.__fcitxBambooWasm) {
        return;
    }

    let instance;
    const memory = function() { return instance.exports.memory; };
    const dataView = function() { return new DataView(memory().buffer); };
    const bytes = function() { return new Uint8Array(memory().buffer); };
    const wasi = {
        sched_yield: function() { return 0; },
        proc_exit: function(code) {
            throw new Error("Bamboo Go runtime exited with status " + code);
        },
        args_get: function() { return 0; },
        args_sizes_get: function(count, size) {
            dataView().setUint32(count, 0, true);
            dataView().setUint32(size, 0, true);
            return 0;
        },
        environ_get: function() { return 0; },
        environ_sizes_get: function(count, size) {
            dataView().setUint32(count, 0, true);
            dataView().setUint32(size, 0, true);
            return 0;
        },
        clock_time_get: function(clock, precision, result) {
            const milliseconds = clock == 1 ? performance.now() : Date.now();
            dataView().setBigUint64(
                result, BigInt(Math.floor(milliseconds * 1000000)), true);
            return 0;
        },
        fd_write: function(fd, iovs, iovsLength, written) {
            let count = 0;
            let message = "";
            const decoder = new TextDecoder();
            for (let i = 0; i < iovsLength; i += 1) {
                const pointer = dataView().getUint32(iovs + i * 8, true);
                const length = dataView().getUint32(iovs + i * 8 + 4, true);
                count += length;
                message += decoder.decode(
                    bytes().subarray(pointer, pointer + length));
            }
            if (message) {
                console.error(message);
            }
            dataView().setUint32(written, count, true);
            return 0;
        },
        random_get: function(pointer, length) {
            const target = bytes().subarray(pointer, pointer + length);
            for (let offset = 0; offset < target.length; offset += 65536) {
                crypto.getRandomValues(target.subarray(
                    offset, Math.min(offset + 65536, target.length)));
            }
            return 0;
        },
        // Bamboo does not block or sleep. Report ENOSYS if that changes.
        poll_oneoff: function() { return 52; },
    };

    const binary = FS.readFile("/usr/lib/fcitx5/bamboo-core.wasm");
    const module = new WebAssembly.Module(binary);
    instance = new WebAssembly.Instance(module, {
        wasi_snapshot_preview1: wasi,
    });
    instance.exports._initialize();
    instance.exports.Init();

    globalThis.__fcitxBambooWasm = {
        exports: instance.exports,
        copyInput: function(pointer, length) {
            const destination = instance.exports.BambooInputBuffer(length);
            if (length) {
                new Uint8Array(instance.exports.memory.buffer,
                               destination, length)
                    .set(HEAPU8.subarray(pointer, pointer + length));
            }
            return destination;
        },
        copyOutput: function(destination, length) {
            if (!length) {
                return;
            }
            const source = instance.exports.BambooOutputPointer();
            HEAPU8.set(new Uint8Array(instance.exports.memory.buffer,
                                     source, length), destination);
        },
    };
});

EM_JS(int, fcitx_bamboo_wasm_process_key_event,
      (uint32_t handle, uint32_t keyVal, uint32_t state), {
          return globalThis.__fcitxBambooWasm.exports.EngineProcessKeyEvent(
              handle, keyVal, state);
      });

EM_JS(void, fcitx_bamboo_wasm_set_restore_key_stroke, (uint32_t handle), {
    globalThis.__fcitxBambooWasm.exports.EngineSetRestoreKeyStroke(handle);
});

EM_JS(uint32_t, fcitx_bamboo_wasm_pull_preedit, (uint32_t handle), {
    return globalThis.__fcitxBambooWasm.exports.EnginePullPreedit(handle);
});

EM_JS(void, fcitx_bamboo_wasm_commit_preedit, (uint32_t handle),
      { globalThis.__fcitxBambooWasm.exports.EngineCommitPreedit(handle); });

EM_JS(uint32_t, fcitx_bamboo_wasm_pull_commit, (uint32_t handle), {
    return globalThis.__fcitxBambooWasm.exports.EnginePullCommit(handle);
});

EM_JS(void, fcitx_bamboo_wasm_set_option,
      (uint32_t handle, int autoNonVnRestore, int ddFreeStyle, int macroEnabled,
       int autoCapitalizeMacro, int spellCheckWithDicts,
       const char *outputCharset, uint32_t outputCharsetLength, int modernStyle,
       int freeMarking),
      {
          const bridge = globalThis.__fcitxBambooWasm;
          const pointer = bridge.copyInput(outputCharset, outputCharsetLength);
          bridge.exports.EngineSetOption(
              handle, autoNonVnRestore, ddFreeStyle, macroEnabled,
              autoCapitalizeMacro, spellCheckWithDicts, pointer,
              outputCharsetLength, modernStyle, freeMarking);
      });

EM_JS(uint32_t, fcitx_bamboo_wasm_new_engine,
      (const char *name, uint32_t nameLength, uint32_t dictionary,
       uint32_t macroTable),
      {
          const bridge = globalThis.__fcitxBambooWasm;
          const pointer = bridge.copyInput(name, nameLength);
          return bridge.exports.NewEngine(pointer, nameLength, dictionary,
                                          macroTable);
      });

EM_JS(uint32_t, fcitx_bamboo_wasm_new_custom_engine,
      (const char *definition, uint32_t definitionLength, uint32_t dictionary,
       uint32_t macroTable),
      {
          const bridge = globalThis.__fcitxBambooWasm;
          const pointer = bridge.copyInput(definition, definitionLength);
          return bridge.exports.NewCustomEngine(pointer, definitionLength,
                                                dictionary, macroTable);
      });

EM_JS(uint32_t, fcitx_bamboo_wasm_new_macro_table,
      (const char *definition, uint32_t definitionLength), {
          const bridge = globalThis.__fcitxBambooWasm;
          const pointer = bridge.copyInput(definition, definitionLength);
          return bridge.exports.NewMacroTable(pointer, definitionLength);
      });

EM_JS(void, fcitx_bamboo_wasm_delete_object, (uint32_t handle),
      { globalThis.__fcitxBambooWasm.exports.DeleteObject(handle); });

EM_JS(void, fcitx_bamboo_wasm_reset_engine, (uint32_t handle),
      { globalThis.__fcitxBambooWasm.exports.ResetEngine(handle); });

EM_JS(uint32_t, fcitx_bamboo_wasm_charset_names, (),
      { return globalThis.__fcitxBambooWasm.exports.GetCharsetNames(); });

EM_JS(uint32_t, fcitx_bamboo_wasm_input_method_names, (),
      { return globalThis.__fcitxBambooWasm.exports.GetInputMethodNames(); });

EM_JS(uint32_t, fcitx_bamboo_wasm_new_dictionary,
      (const char *contents, uint32_t contentsLength), {
          const bridge = globalThis.__fcitxBambooWasm;
          const pointer = bridge.copyInput(contents, contentsLength);
          return bridge.exports.NewDictionary(pointer, contentsLength);
      });

EM_JS(void, fcitx_bamboo_wasm_copy_output, (char *destination, uint32_t length),
      { globalThis.__fcitxBambooWasm.copyOutput(destination, length); });
// clang-format on

namespace {

std::string packDefinition(char **definition) {
    std::string result;
    for (size_t i = 0; definition[i] && definition[i + 1]; i += 2) {
        result.append(definition[i]);
        result.push_back('\0');
        result.append(definition[i + 1]);
        result.push_back('\0');
    }
    return result;
}

char *copyOutput(uint32_t size) {
    auto *result = static_cast<char *>(malloc(size + 1));
    if (!result) {
        throw std::bad_alloc();
    }
    fcitx_bamboo_wasm_copy_output(result, size);
    result[size] = '\0';
    return result;
}

char **splitOutput(uint32_t size) {
    std::vector<std::string> values;
    char *output = copyOutput(size);
    std::string packed(output, size);
    free(output);
    size_t begin = 0;
    while (begin < packed.size()) {
        auto end = packed.find('\0', begin);
        if (end == std::string::npos) {
            end = packed.size();
        }
        values.emplace_back(packed.substr(begin, end - begin));
        begin = end + 1;
    }

    auto **result =
        static_cast<char **>(calloc(values.size() + 1, sizeof(char *)));
    if (!result) {
        throw std::bad_alloc();
    }
    for (size_t i = 0; i < values.size(); i++) {
        result[i] = strdup(values[i].c_str());
        if (!result[i]) {
            throw std::bad_alloc();
        }
    }
    return result;
}

} // namespace

extern "C" void Init() { fcitx_bamboo_wasm_init(); }

extern "C" uint8_t EngineProcessKeyEvent(uintptr_t engine, uint32_t keyVal,
                                          uint32_t state) {
    return fcitx_bamboo_wasm_process_key_event(engine, keyVal, state);
}

extern "C" void EngineSetRestoreKeyStroke(uintptr_t engine) {
    fcitx_bamboo_wasm_set_restore_key_stroke(engine);
}

extern "C" char *EnginePullPreedit(uintptr_t engine) {
    return copyOutput(fcitx_bamboo_wasm_pull_preedit(engine));
}

extern "C" void EngineCommitPreedit(uintptr_t engine) {
    fcitx_bamboo_wasm_commit_preedit(engine);
}

extern "C" char *EnginePullCommit(uintptr_t engine) {
    return copyOutput(fcitx_bamboo_wasm_pull_commit(engine));
}

extern "C" void EngineSetOption(uintptr_t engine,
                                FcitxBambooEngineOption *option) {
    fcitx_bamboo_wasm_set_option(
        engine, option->autoNonVnRestore, option->ddFreeStyle,
        option->macroEnabled, option->autoCapitalizeMacro,
        option->spellCheckWithDicts, option->outputCharset,
        strlen(option->outputCharset), option->modernStyle,
        option->freeMarking);
}

extern "C" uintptr_t NewEngine(cchar *name, uintptr_t dictionary,
                                uintptr_t macroTable) {
    return fcitx_bamboo_wasm_new_engine(name, strlen(name), dictionary,
                                        macroTable);
}

extern "C" uintptr_t NewCustomEngine(char **definition, uintptr_t dictionary,
                                      uintptr_t macroTable) {
    const auto packed = packDefinition(definition);
    return fcitx_bamboo_wasm_new_custom_engine(packed.data(), packed.size(),
                                               dictionary, macroTable);
}

extern "C" uintptr_t NewMacroTable(char **definition) {
    const auto packed = packDefinition(definition);
    return fcitx_bamboo_wasm_new_macro_table(packed.data(), packed.size());
}

extern "C" void DeleteObject(uintptr_t handle) {
    fcitx_bamboo_wasm_delete_object(handle);
}

extern "C" void ResetEngine(uintptr_t engine) {
    fcitx_bamboo_wasm_reset_engine(engine);
}

extern "C" char **GetCharsetNames() {
    return splitOutput(fcitx_bamboo_wasm_charset_names());
}

extern "C" char **GetInputMethodNames() {
    return splitOutput(fcitx_bamboo_wasm_input_method_names());
}

extern "C" uintptr_t NewDictionary(uintptr_t rawFD) {
    const int fd = rawFD;
    struct CloseFD {
        int fd;
        ~CloseFD() { close(fd); }
    } closeFD{fd};

    std::string contents;
    std::array<char, 8192> buffer;
    while (true) {
        const auto size = read(fd, buffer.data(), buffer.size());
        if (size < 0) {
            throw std::runtime_error("Failed to read Bamboo dictionary");
        }
        if (size == 0) {
            break;
        }
        contents.append(buffer.data(), size);
    }
    return fcitx_bamboo_wasm_new_dictionary(contents.data(), contents.size());
}
