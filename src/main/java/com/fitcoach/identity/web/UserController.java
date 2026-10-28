package com.fitcoach.identity.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserDirectory userDirectory;

    public UserController(UserDirectory userDirectory) {
        this.userDirectory = userDirectory;
    }

    /** 401 si le compte du jeton n'existe plus : le frontend deconnecte alors l'utilisateur. */
    @GetMapping("/me")
    public UserSummary me(Authentication authentication) {
        return userDirectory
                .findById(AuthenticatedUsers.id(authentication))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
